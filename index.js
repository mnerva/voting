const express = require('express');
const app = express();
const mysql = require('mysql2');
const port = 3000;
const path = require('path');
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'hasti_turvaline_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Setup database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'voting_system',
  password: 'qwerty'
});

//  iga kord kui server starditakse on uus hääletamise session
let currentSessionId;

function initializeNewSession() {
  pool.query('INSERT INTO TULEMUSED (haaletanute_arv, h_alguse_aeg) VALUES (0, NOW())', (error, results, fields) => {
    if (error) {
      console.error('Error when inserting new session:', error);
      return;
    }
    currentSessionId = results.insertId;
    console.log('New session started with session ID:', currentSessionId);
  });
}

initializeNewSession();

// Connect to MySQL
pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release()
});

// html form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// timer
let votingAllowed = true;
const votingPeriod = 50000;

setTimeout(() => {
  votingAllowed = false;
  console.log("Voting has ended.");
}, votingPeriod);

// Post identification
app.post('/identification', (req, res) => {
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

      // If voting time has expired, redirect to summary page
      if (!votingAllowed) {
        return res.redirect('/summary.html');
        return;
      }

      // Redirect to voting page if the user is found
      const voteCheckQuery = 'SELECT otsus FROM HAALETUS WHERE Haaletaja_id = ? AND Session_id = ?';
      pool.query(voteCheckQuery, [req.session.userId, currentSessionId], (error, voteResults) => {
        if (error) {
          console.error('Error checking user vote:', error);
          return res.send(renderIdentificationPage('Andmebaasi päring ebaõnnestus, palun proovige uuesti'));
          return;
        }
        if (voteResults.length > 0) {
          // If a vote record exists for this session, redirect to confirmation page
          res.redirect('/confirmation.html');
        } else {
          // No vote recorded for this session, redirect to voting page
          res.redirect('/vote.html');
        }
      });
    }
  });
});

function renderIdentificationPage(errorMessage) {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Indetification</title>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  </head>
  
  <body>
      <div>
          <div><i class="material-icons">account_circle</i><span id="voter_name">Külaline</span></div>
          <div><i class="material-icons">access_time</i><span id="timer">Timer</span></div>
      </div>
      <hr>
      <div>
          <p>Tuvasta oma isik: </p>
          <form action="/identification" method="post">
              <label for="firstname">Eesnimi:</label>
              <input type="text" id="firstname" name="firstname"><br>
              <label for="lastname">Perenimi:</label>
              <input type="text" id="lastname" name="lastname"><br>
              <p class="error-message">${errorMessage}</p>
              <input type="submit" value="Submit">
          </form>
      </div>
  </body>
  </html>`
}

app.post('/vote', (req, res) => {
  // Redirect back to indentification page if there is a problem with session
  if (!req.session.userId) {
    res.redirect('/index.html');
    return;
  }

  // check whether time has already ran up
  if (!votingAllowed) {
    res.redirect('/summary.html');
    return;
  }

  const vote = req.body.vote;
  const userId = req.session.userId;
  const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');

  if (typeof currentSessionId === 'undefined') {
    console.error('Session ID is not initialized');
    return res.status(500).send('Internal Server Error: Session ID is not available.');
  }

  const query = 'UPDATE HAALETUS SET otsus = ?, haaletuse_aeg = ?, Session_id = ? WHERE Haaletaja_id = ?';

  pool.query(query, [vote, currentTime, currentSessionId, userId], (error, results) => {
    if (error || results.affectedRows === 0) {
      console.error('Database error or no rows updated:', error);
      return res.send(renderVotingPage('Andmebaasi päring ebaõnnestus, palun proovige uuesti'));
    } else {
      // save the vote and id in the session, redirect to confirmation page
      req.session.vote = vote;
      req.session.voteSessionId = currentSessionId;
      res.redirect('/confirmation.html');
    }
  });
});

function renderVotingPage(errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hääletus</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="index.js"></script>
</head>
<body>
    <div>
        <div><i class="material-icons">account_circle</i><span id="voter_name">Külaline</span></div>
        <div><i class="material-icons">access_time</i><span id="timer">Timer</span></div>
    </div>
    <hr>
    <div>
        <p>Langeta oma otsus</p>
        <form id="voteForm">
            <input type="radio" id="poolt" name="vote" value="Poolt">
            <label for="poolt" class="vote-button">Poolt</label>
            <input type="radio" id="vastu" name="vote" value="Vastu">
            <label for="vastu" class="vote-button">Vastu</label>
            <p class="error-message">${errorMessage}</p>
            <button type="button" onclick="sendData()">Saada</button>
        </form>
    </div>
</body>
</html>`;
}

// allows to retrieve for the individual vote result
app.get('/get-vote', (req, res) => {
  // console.log("Current Session Data:", req.session);
  const sessionID = req.session.voteSessionId;

  if (!sessionID) {
    return res.status(404).send('Session ID is missing.');
  }

  const query = 'SELECT otsus FROM HAALETUS WHERE Session_id = ? AND Haaletaja_id = ?';
  pool.query(query, [sessionID, req.session.userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database query failed.');
    }
    if (results.length > 0) {
      res.json({ vote: results[0].otsus });
    } else {
      console.log("No vote found in current session.");
      res.status(404).send('No vote recorded');
    }
  });
});

// retrieves the voter's name
app.get('/get-username', (req, res) => {
  if (req.session && req.session.userId) {
    const userId = req.session.userId;
    const query = 'SELECT eesnimi, perenimi FROM HAALETUS WHERE Haaletaja_id = ?';
    pool.query(query, [userId], (error, results) => {
      if (error || results.length === 0) {
        return res.status(404).send('User not found');
      }
      const user = results[0];
      const fullName = user.eesnimi + ' ' + user.perenimi;
      res.json({ name: fullName });
    });
  } else {
    res.status(404).send('Session userId not found');
  }
});

// timer
let votingEndTime = new Date(Date.now() + votingPeriod);

app.get('/timer', (req, res) => {
  let currentTime = new Date();
  let timeLeft = votingEndTime - currentTime;
  if (timeLeft <= 0) {
    res.json({ timeLeft: 0, votingEnded: true });
  } else {
    res.json({ timeLeft, votingEnded: false });
  }
});

// results
app.get('/results', (req, res) => {
  const query = 'SELECT poolt, vastu FROM TULEMUSED WHERE Session_id = ?';
  pool.query(query, [currentSessionId], (error, results) => {
    if (error) {
      console.error('Failed to retrieve results:', error);
      res.status(500).send('Failed to retrieve voting results');
    } else {
      res.json(results[0]);
    }
  });
});

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});