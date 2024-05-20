const fs = require('fs');
const axios = require('axios');
const path = require('path');

const filePath = path.join(__dirname, 'test.pdf');
const chunkSize = 1024 * 1024; // 1 MB
const serverUrl = 'http://localhost:3000/api/upload';

async function uploadFile() {
    try {
        const data = fs.readFileSync(filePath);
        const fileSize = data.length;
        const totalChunks = Math.ceil(fileSize / chunkSize);
        const baseName = `tmp_${Date.now()}_${path.basename(filePath)}`;

        console.log('Testing Upload...');

        for (let i = 0; i < totalChunks; i++) {
            const chunkData = data.slice(i * chunkSize, (i + 1) * chunkSize);
            const base64Data = chunkData.toString('base64');

            const payload = {
                ext: 'pdf',
                chunk: `data:application/pdf;base64,${base64Data}`,
                chunkIndex: i,
                totalChunks: totalChunks,
                baseName: baseName
            };

            try {
                console.log(`Uploading chunk ${i + 1} of ${totalChunks}`);
                const response = await axios.post(serverUrl, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log(`Status: ${response.status}`);
                console.log(`Chunk ${i + 1}/${totalChunks}:`, response.data);
            } catch (error) {
                console.error(`Failed to upload chunk ${i + 1}:`, error.response?.data || error.message);
                break;
            }
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

uploadFile();
