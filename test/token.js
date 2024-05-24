const axios = require('axios');

const TokenAPI = 'http://localhost:3000/api/token';
const TokensAPI = 'http://localhost:3000/api/tokens';

const testData = {
    user_address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 31337,
    metadata: {
        name: 'Test Token',
        description: 'This is a test token',
        externalURL: 'https://example.com',
        images: [
            'tmp_1716298773918_test.jpg',
            'tmp_1716298773920_test.png'
        ],
        document1: 'tmp_1716298773918_test1.pdf',
        document2: 'tmp_1716298773919_test2.pdf'
    }
};

async function testTokenRoutes() {
    try {
        console.log('Testing POST /api/token');
        const postResponse = await axios.post(`${TokenAPI}/1`, testData);
        console.log('POST Response:', postResponse.data);

        const tokenId = postResponse.data.tokenId;

        console.log(`Testing GET /api/token/${tokenId}`);
        const getResponse = await axios.get(`${TokenAPI}/${tokenId}`);
        console.log('GET Response:', getResponse.data);

        console.log(`Testing PUT /api/token/${tokenId}`);
        const updateData = { name: 'Updated Test Token', description: 'Updated description' };
        const putResponse = await axios.put(`${TokenAPI}/${tokenId}`, updateData);
        console.log('PUT Response:', putResponse.data);

        console.log('Testing GET /api/tokens');
        const metadataResponse = await axios.get(TokensAPI, { params: { tokenIds: [tokenId] } });
        console.log('GET Tokens Response:', metadataResponse.data);

        console.log('Testing DELETE /api/tokens');
        const deleteAllResponse = await axios.delete(`${TokenAPI}s`);
        console.log('DELETE ALL Response:', deleteAllResponse.data);

    } catch (error) {
        console.error('Error testing token routes:', error.response ? error.response.data : error.message);
    }
}

testTokenRoutes();
