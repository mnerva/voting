// index.test.js
const { updateResults } = require('../public/index');

describe('updateResults', () => {
    beforeEach(() => {
        // Set up a DOM element before each test
        document.body.innerHTML = '<div id="results"></div>';

        // Reset the fetch mock
        global.fetch = jest.fn();
    });

    afterEach(() => {
        // Clean up fetch mock
        global.fetch.mockRestore();
    });

    it('should update the results div with fetched data', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ poolt: 10, vastu: 20 }),
            })
        );

        await updateResults();

        const resultsDiv = document.getElementById('results');
        expect(resultsDiv.textContent).toBe('Poolt: 10 Vastu: 20');
    });

    it('should handle fetch errors gracefully', async () => {
        global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Fetch error')));

        console.error = jest.fn(); // Mock console.error

        // Use await expect to handle the promise rejection
        await expect(updateResults()).rejects.toThrow('Fetch error');

        expect(console.error).toHaveBeenCalledWith('Error db:', new Error('Fetch error'));
    });
});
