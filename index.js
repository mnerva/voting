const express = require('express');
const app = express();
const mysql = require('mysql2');
const port = 3000;
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
app.post('/indentification', (req, res) => {
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
                <title>Identification</title>
            </head>
            <body>
                <div>
                    <p>Tuvasta oma isik:</p>
                    <form action="/indentification" method="post">
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

        // Redirect to voting page if the user is found
        res.redirect('/vote.html');
    });
});

// start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});