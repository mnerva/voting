const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // Import the cors middleware
const crypto = require('crypto')
const path = require('path')

const app = express();
const port = 3000;

// Middleware for parsing JSON data in the request body
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes


// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'login'
  });

// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error('MySQL connection error:', err);
    } else {
      console.log('Connected to MySQL database');
    }
  });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST endpoint for submitting text
app.post('/submit-text', (req, res) => {
    const { text, password } = req.body;
  
    if (!text || !password) {
      return res.status(400).json({ error: 'Text and password are required' });
    }
  
    // Insert text into the database
    const query = 'INSERT INTO login (tekst, password) VALUES (?, ?)';
  
    const encryptedPassword = crypto.createHash('md5').update(password).digest('hex');
  
    db.query(query, [text, encryptedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting text into the database:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ message: 'Text and password submitted and saved to the database' });
      }
    });
  });

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });