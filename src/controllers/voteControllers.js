const path = require('path');
const pool = require('../config/db');
const { renderIdentificationPage, renderVotingPage } = require('../additional/renderTemplates.js');
const { initializeNewSession } = require('../additional/sessionManager.js');
const { getRemainingTime, isVotingAllowed, votingEndTime } = require('../additional/votingTimer');

// Initialize a new voting session
initializeNewSession();

// Controller functions here, example:
exports.getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
};

exports.postIdentification = (req, res) => {
    const { firstname, lastname } = req.body;
    const query = 'SELECT * FROM HAALETUS WHERE LOWER(eesnimi) = LOWER(?) AND LOWER(perenimi) = LOWER(?)';
    pool.query(query, [firstname, lastname], (err, results) => {
        if (err || results.length === 0) {
            // If an error occurs, show this page and stop further processing
            return res.send(renderIdentificationPage('Isiku tuvastamine ebaõnnestus, palun proovige uuesti'));
            return;
        } else {
            // Set userId in session
            req.session.userId = results[0].Haaletaja_id;

            // Redirect depending on the situation
            const voteCheckQuery = 'SELECT otsus FROM HAALETUS WHERE Haaletaja_id = ? AND Session_id = ?';
            pool.query(voteCheckQuery, [req.session.userId, currentSessionId], (error, voteResults) => {
                if (error) {
                    console.error('Error checking user vote:', error);
                    return res.send(renderIdentificationPage('Andmebaasi päring ebaõnnestus, palun proovige uuesti'));
                    return;
                }
                if (voteResults.length > 0) {
                    // If a vote record exists for this session, redirect to confirmation page
                    res.sendFile(path.join(__dirname, '../../public/confirmation.html'));
                } else {
                    // If a vote record doesn't exist for this session, redirect to voting page
                    res.sendFile(path.join(__dirname, '../../public/vote.html'));
                    // If voting time has expired, redirect to summary page
                    if (!isVotingAllowed) {
                        res.sendFile(path.join(__dirname, '../../public/summary.html'));
                        return;
                    }
                }
            });
        }
    });
};

exports.postVote = (req, res) => {
  // Redirect back to identification page if there is a problem with session
  if (!req.session.userId) {
      res.redirect('/');
      return;
  }

  // Check whether the voting time has already run out
  if (!isVotingAllowed()) {
      res.redirect('/summary');
      return;
  }

  const vote = req.body.vote;
  const userId = req.session.userId;
  const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');

  // Check whether the currentSessionId is defined
  if (typeof currentSessionId === 'undefined') {
      console.error('Session ID undefined');
      return res.status(500).send('Session ID undefined');
  }

  const query = 'UPDATE HAALETUS SET otsus = ?, haaletuse_aeg = ?, Session_id = ? WHERE Haaletaja_id = ?';
  pool.query(query, [vote, currentTime, currentSessionId, userId], (error, results) => {
      if (error || results.affectedRows === 0) {
          console.error('Database error or no rows updated:', error);
          return res.status(500).send(renderVotingPage('Andmebaasi päring ebaõnnestus, palun proovige uuesti'));
      } else {
          // Save the vote and id in the session, redirect to confirmation page
          req.session.vote = vote;
          req.session.voteSessionId = currentSessionId;
          return res.redirect('/confirmation.html');
      }
  });
};

exports.getVote = (req, res) => {
    const sessionID = req.session.voteSessionId;

  if (!sessionID) {
    return res.status(404).send('Session ID is missing.');
  }

  const query = 'SELECT otsus FROM HAALETUS WHERE Session_id = ? AND Haaletaja_id = ?';
  pool.query(query, [sessionID, req.session.userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Andmebaasi päring ebaõnnestus, palun proovige uuesti');
    }
    if (results.length > 0) {
      res.json({ vote: results[0].otsus });
    } else {
      res.status(404).send('Hääl pole salvestatu');
    }
  });
};

exports.getUsername = (req, res) => {
    if (req.session && req.session.userId) {
        const userId = req.session.userId;
        const query = 'SELECT eesnimi, perenimi FROM HAALETUS WHERE Haaletaja_id = ?';
        pool.query(query, [userId], (error, results) => {
          if (error || results.length === 0) {
            return res.status(404).send('Kasutajat ei leitud');
          }
          const user = results[0];
          const fullName = user.eesnimi + ' ' + user.perenimi;
          res.json({ name: fullName });
        });
      } else {
        res.status(404).send('Session userId ei leitud');
      }
};

exports.getTimer = (req, res) => {
  if (isVotingAllowed()) {
    res.json({
      status: "Voting Active",
      timeLeft: getRemainingTime(),
      endTime: votingEndTime
    });
  } else {
    res.json({
      status: "Voting Ended",
      timeLeft: 0,
      endTime: votingEndTime
    });
  }
};

exports.getResults = (req, res) => {
    const query = 'SELECT poolt, vastu FROM TULEMUSED WHERE Session_id = ?';
  pool.query(query, [currentSessionId], (error, results) => {
    if (error) {
      console.error('Error results:', error);
      res.status(500).send('Failed to retrieve voting results');
    } else {
      res.json(results[0]);
    }
  });
}; 