const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SoldABTsAPI = 'http://localhost:3000/api/soldABTs';
const GrossRevenueAPI = 'http://localhost:3000/api/grossRevenue';
const ExportMarketplaceDataAPI = 'http://localhost:3000/api/exportMarketplaceData';

const walletAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

async function testMarketplaceDataRoutes() {
    try {
        console.log('Testing GET /api/soldABTs with wallet address');
        const soldABTsResponse = await axios.get(SoldABTsAPI, { params: { wallet: walletAddress } });
        console.log('GET /api/soldABTs Response:', soldABTsResponse.data);

        console.log('Testing GET /api/grossRevenue with wallet address');
        const grossRevenueResponse = await axios.get(GrossRevenueAPI, { params: { wallet: walletAddress } });
        console.log('GET /api/grossRevenue Response:', grossRevenueResponse.data);

        console.log('Testing GET /api/exportMarketplaceData with wallet address');
        const exportResponse = await axios.get(ExportMarketplaceDataAPI, {
            params: { wallet: walletAddress },
            responseType: 'stream'
        });

        // const filePath = path.resolve(__dirname, `export_${Date.now()}_${walletAddress}.csv`);
        // const writer = fs.createWriteStream(filePath);

        // exportResponse.data.pipe(writer);

        // writer.on('finish', () => {
        //     console.log(`CSV file saved successfully as ${filePath}`);
        // });

        // writer.on('error', (error) => {
        //     console.error('Error writing CSV file:', error);
        // });
    } catch (error) {
        console.error('Error testing marketplace data routes:', error.response ? error.response.data : error.message);
    }
}

testMarketplaceDataRoutes();
