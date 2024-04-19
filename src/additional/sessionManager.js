const pool = require('../config/db');

exports.initializeNewSession = () => {
    pool.query('INSERT INTO TULEMUSED (haaletanute_arv, h_alguse_aeg) VALUES (0, NOW())', (error, results) => {
        if (error) {
          console.error('Error db:', error);
          return;
        }
        currentSessionId = results.insertId;
      });
  };
  
  exports.checkVoteStatus = (userId, sessionId) => {
    // Logic to check voting status
  };