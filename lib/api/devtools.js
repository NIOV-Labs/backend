const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

function addRoutes(app) {
    // Add route to serve 31337.json
    app.route('/api/getContracts').get((req, res) => {
        const filePath = './utils/deploymentMap/31337.json';
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Failed to load contracts');
            }
            res.json(JSON.parse(data));
        });
    });

    // Add route to get blocks
    app.route('/api/getBlocks').get(async (req, res) => {
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        const blockNumber = await provider.getBlockNumber();
        const blocks = [];
        
        for (let i = blockNumber; i >= 0; i--) {
            const block = await provider.getBlock(i);
            blocks.push(block);
        }

        res.json(blocks);
    });

    // Function to read directory structure
    async function readDirectoryStructure(dir) {
        const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map(async (dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? { [dirent.name]: await readDirectoryStructure(res) } : dirent.name;
        }));
        return files;
    }

    // Add route to list folders and their files in the uploads directory
    app.route('/api/getUploads').get(async (req, res) => {
        const uploadsDir = path.join(__dirname, '../../uploads');
        console.log(`Reading directory: ${uploadsDir}`);

        try {
            const directoryStructure = await readDirectoryStructure(uploadsDir);
            console.log('Directory structure:', JSON.stringify(directoryStructure, null, 2));

            res.json(directoryStructure);
        } catch (err) {
            console.error(`Error reading directory: ${err.message}`);
            res.status(500).send('Failed to read uploads directory');
        }
    });

    // Fallback route to serve index.html on 404
    app.use((req, res) => {
        res.sendFile('index.html', { root: '.' });
    });
}

module.exports = { addRoutes };
