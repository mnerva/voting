let votingAllowed = true;
const votingPeriod = 50000;
const votingEndTime = new Date(Date.now() + votingPeriod);

setTimeout(() => {
  votingAllowed = false;
  console.log("Voting period has ended.");
}, votingPeriod);

function getRemainingTime() {
  const now = new Date();
  return Math.max(votingEndTime - now, 0);
}

module.exports = {
  isVotingAllowed: () => votingAllowed,
  getRemainingTime,
  votingEndTime
};