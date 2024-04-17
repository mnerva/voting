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

// Post identification
app.post('/identification', (req, res) => {
  const { firstname, lastname } = req.body;
  const query = 'SELECT * FROM HAALETUS WHERE LOWER(eesnimi) = LOWER(?) AND LOWER(perenimi) = LOWER(?)';

  pool.query(query, [firstname, lastname], (err, results) => {
    if (err || results.length === 0) {
      // If an error occurs, show this page and stop further processing
      let errorMessage = 'Isiku tuvastamine ebaõnnestus, palun proovige uuesti';
      return res.send(`<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Indetification</title>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      </head>
      
      <body>
          <div>
              <div><i class="material-icons">account_circle</i><p>Külaline<p></div>
              <div><i class="material-icons">access_time</i><p>Timer<p></div>
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
      </html>`);
    }
    // Set userId in session
    req.session.userId = results[0].Haaletaja_id;

    // Redirect to voting page if the user is found
    res.redirect('/vote.html');
  });
});

app.post('/vote', (req, res) => {
  // Redirect back to indentification page if there is a problem with session
  if (!req.session.userId) {
    res.redirect('/index.html');
    return;
  }

  const vote = req.body.vote;
  const userId = req.session.userId;
  const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ')
  const query = 'UPDATE HAALETUS SET otsus = ?, haaletuse_aeg = ? WHERE Haaletaja_id = ?';

  pool.query(query, [vote, currentTime, userId], (error, results) => {
    if (error || results.affectedRows === 0) {
      let errorMessage = 'Andmebaasi päring ebaõnnestus, palun proovige uuesti';
      return res.send(`<<!DOCTYPE html>
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
      
      </html>`);
    }

    // save the vote in the session
    req.session.vote = vote;
    res.redirect('/confirmation.html');
  });
});

// allows to retrieve for the individual vote result
app.get('/get-vote', (req, res) => {
  if (req.session && req.session.vote) {
    res.json({ vote: req.session.vote });
  } else {
    res.status(404).send('No vote recorded');
  }
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

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});