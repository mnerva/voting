const { afterEach } = require('node:test');
const { postVote } = require('../src/controllers/voteControllers.js');
const { initializeNewSession } = require('../src/additional/sessionManager.js')
const pool = require('../src/config/db')

test('should not call initializeNewSession during the test', () => {
    expect(initializeNewSession).not.toHaveBeenCalled();
});

jest.mock('../src/additional/sessionManager.js', () => ({
    initializeNewSession: jest.fn(), // Mock the function
}));

jest.mock('../src/config/db', () => ({
    query: jest.fn(), // Mock the `query` method
    getConnection: jest.fn((callback) => callback(null, { // Mock getConnection method
        query: jest.fn(),
        release: jest.fn(), // Mock the release method as well
    })),
}));

let originalIsVotingAllowed;
let originalCurrentSessionId;

beforeAll(() => {
    // Store original global variables if needed
    originalIsVotingAllowed = global.isVotingAllowed;
    originalCurrentSessionId = global.currentSessionId;
});

beforeEach(() => {
    req = {
        session: {
            destroy: jest.fn((callback) => callback()), // Mock session destruction
        },
        body: {},
    };
    res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };

    // Mock global variables
    global.isVotingAllowed = jest.fn();
    global.currentSessionId = 'someSessionId'; // Default value
});

afterAll(() => {
    // Restore original global variables if needed
    global.isVotingAllowed = originalIsVotingAllowed;
    global.currentSessionId = originalCurrentSessionId;
});

afterEach(() => {
    pool.end();
})

describe('postVote function', () => {
    it('should redirect to the home page if userId is missing from the session', () => {
        postVote(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
    it('should return 500 if currentSessionId is undefined', () => {
        global.currentSessionId = undefined;

        req.session.userId = 'someUserId';
        req.body.vote = 'testVote';

        postVote(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Session ID undefined');
    });
});
