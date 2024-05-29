const axios = require('axios');

const SoldABTsAPI = 'http://localhost:3000/api/soldABTs';
const GrossRevenueAPI = 'http://localhost:3000/api/grossRevenue';

const walletAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

async function testMarketplaceDataRoutes() {
    try {
        console.log('Testing GET /api/soldABTs with wallet address');
        const soldABTsResponse = await axios.get(SoldABTsAPI, { params: { wallet: walletAddress } });
        console.log('GET /api/soldABTs Response:', soldABTsResponse.data);

        console.log('Testing GET /api/grossRevenue with wallet address');
        const grossRevenueResponse = await axios.get(GrossRevenueAPI, { params: { wallet: walletAddress } });
        console.log('GET /api/grossRevenue Response:', grossRevenueResponse.data);
    } catch (error) {
        console.error('Error testing marketplace data routes:', error.response ? error.response.data : error.message);
    }
}

testMarketplaceDataRoutes();
