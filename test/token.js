const axios = require('axios');

const serverUrl = 'http://localhost:3000/api/token';
const metadataUrl = 'http://localhost:3000/api/tokens/metadata';

// Test data
const testData = {
    user_address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'localhost',
    metadata: {
        name: 'Test Token',
        description: 'This is a test token',
        externalURL: 'https://example.com',
        image: 'tmp_1716298773918_test.jpg',
        document: 'tmp_1716298773918_test.pdf'
    }
};

// Function to test POST, GET, PUT, DELETE, and the new metadata route
async function testTokenRoutes() {
    try {
        // POST request to create a new token
        console.log('Testing POST /api/token');
        const postResponse = await axios.post(`${serverUrl}/1`, testData);
        console.log('POST Response:', postResponse.data);

        const tokenId = postResponse.data.tokenId;

        // GET request to retrieve the created token
        console.log(`Testing GET /api/token/${tokenId}`);
        const getResponse = await axios.get(`${serverUrl}/${tokenId}`);
        console.log('GET Response:', getResponse.data);

        // PUT request to update the created token
        console.log(`Testing PUT /api/token/${tokenId}`);
        const updateData = { name: 'Updated Test Token', description: 'Updated description' };
        const putResponse = await axios.put(`${serverUrl}/${tokenId}`, updateData);
        console.log('PUT Response:', putResponse.data);

        // Test the new metadata route with an array of token IDs
        console.log('Testing POST /api/tokens');
        const metadataResponse = await axios.post(metadataUrl, { tokenIds: [tokenId] });
        console.log('METADATA Response:', metadataResponse.data);

        // DELETE request to delete the created token
        console.log(`Testing DELETE /api/token/${tokenId}`);
        const deleteResponse = await axios.delete(`${serverUrl}/${tokenId}`);
        console.log('DELETE Response:', deleteResponse.data);

        // DELETE request to delete all tokens
        console.log('Testing DELETE /api/tokens');
        const deleteAllResponse = await axios.delete(`${serverUrl}s`);
        console.log('DELETE ALL Response:', deleteAllResponse.data);

    } catch (error) {
        console.error('Error testing token routes:', error.response ? error.response.data : error.message);
    }
}

testTokenRoutes();
