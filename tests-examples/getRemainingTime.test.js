const { afterEach } = require('node:test');
const { getRemainingTime } = require('../src/additional/votingTimer.js'); // Adjust the path
let votingEndTime;
let votingPeriod;

describe('getRemainingTime', () => {
  beforeEach(() => {
    // Set the votingPeriod and calculate votingEndTime
    votingPeriod = 300000; // 5 minutes in milliseconds
    votingEndTime = new Date(Date.now() + votingPeriod);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the correct remaining time', () => {
    const now = new Date();
    const expectedRemainingTime = votingEndTime - now;

    // Check if the remaining time is close to what is expected (with a small tolerance for timing differences)
    expect(getRemainingTime()).toBeGreaterThanOrEqual(expectedRemainingTime - 10); // Allow slight delay due to test execution time
  });

  it('should return 0 if the votingEndTime has already passed', () => {
    jest.useFakeTimers(); // Use fake timers
    jest.setSystemTime(Date.now() + votingPeriod + 1000); // Move time forward by 5 minutes and 1 second

    expect(getRemainingTime()).toBe(0);

    jest.useRealTimers();
  });
});
