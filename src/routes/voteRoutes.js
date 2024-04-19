const express = require('express');
const router = express.Router();
const {
  getHomePage,
  postIdentification,
  postVote,
  getVote,
  getUsername,
  getResults,
  getTimer
} = require('../controllers/voteControllers');

router.get('/', getHomePage);
router.post('/identification', postIdentification);
router.post('/vote', postVote);
router.get('/get-vote', getVote);
router.get('/get-username', getUsername);
router.get('/timer', getTimer);
router.get('/results', getResults);

module.exports = router;