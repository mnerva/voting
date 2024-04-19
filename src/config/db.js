const mysql = require('mysql2');

// Setup database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'voting_system',
  password: 'qwerty'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error MySQL:', err);
    return;
  }
  console.log("Connected to MySQL successfully!");
  connection.release();
});
module.exports = pool;