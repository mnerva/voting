const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const voteRoutes = require('./src/routes/voteRoutes');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'hasti_turvaline_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', voteRoutes);

module.exports = app;

// start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

