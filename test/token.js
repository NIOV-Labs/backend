const axios = require('axios');

const TokenAPI = 'http://localhost:3000/api/token';
const TokensAPI = 'http://localhost:3000/api/tokens';

const testData1 = {
    user_address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 31337,
    metadata: {
        name: 'Test Token 1',
        description: 'This is the first test token',
        externalURL: 'https://example.com',
        images: [
            'tmp_1716298773918_test1.jpg',
            'tmp_1716298773920_test1.png'
        ],
        document1: 'tmp_1716298773918_test1.pdf',
        document2: 'tmp_1716298773919_test1.pdf'
    }
};

const testData2 = {
    user_address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 31337,
    metadata: {
        name: 'Test Token 2',
        description: 'This is the second test token',
        externalURL: 'https://example.com',
        images: [
            'tmp_1716298773918_test2.jpg',
            'tmp_1716298773920_test2.png'
        ],
        document1: 'tmp_1716298773918_test2.pdf',
        document2: 'tmp_1716298773919_test2.pdf'
    }
};

async function testTokenRoutes() {
    try {
        console.log('Testing POST /api/token for the first token');
        const postResponse1 = await axios.post(`${TokenAPI}/1`, testData1);
        console.log('POST Response 1:', postResponse1.data);
        const tokenId1 = postResponse1.data.newToken.onChainID;

        console.log('Testing POST /api/token for the second token');
        const postResponse2 = await axios.post(`${TokenAPI}/2`, testData2);
        console.log('POST Response 2:', postResponse2.data);
        const tokenId2 = postResponse2.data.newToken.onChainID;

        console.log(`Testing GET /api/token/${tokenId1}`);
        const getResponse = await axios.get(`${TokenAPI}/${tokenId1}`);
        console.log('GET Response:', getResponse.data);

        console.log(`Testing PUT /api/token/${tokenId1}`);
        const updateData = { name: 'Updated Test Token 1', description: 'Updated 1 description' };
        const putResponse = await axios.put(`${TokenAPI}/${tokenId1}`, updateData);
        console.log('PUT Response:', putResponse.data);

        console.log('Testing GET /api/tokens');
        const metadataResponse = await axios.get(TokensAPI, { params: { tokenIds: [tokenId1, tokenId2] } });
        console.log('GET Tokens Response:', metadataResponse.data);

        console.log('Testing DELETE /api/tokens');
        const deleteAllResponse = await axios.delete(`${TokenAPI}s`);
        console.log('DELETE ALL Response:', deleteAllResponse.data);

    } catch (error) {
        console.error('Error testing token routes:', error.response ? error.response.data : error.message);
    }
}

testTokenRoutes();
