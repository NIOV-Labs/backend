const fs = require('fs');
const axios = require('axios');
const path = require('path');

const filePath = path.join(__dirname, 'test.pdf');
const fileSize = fs.statSync(filePath).size;
const chunkSize = 1024 * 1024;
const totalChunks = Math.ceil(fileSize / chunkSize);

fs.readFile(filePath, async (err, data) => {
    if (err) return console.error(err);

    for (let i = 0; i < totalChunks; i++) {
        const chunkData = data.slice(i * chunkSize, (i + 1) * chunkSize);
        const base64Data = chunkData.toString('base64');

        try {
            const response = await axios.post('http://localhost:3000/upload', {
                ext: 'pdf',
                chunk: `data:application/pdf;base64,${base64Data}`,
                chunkIndex: i,
                totalChunks: totalChunks
            });
            console.log(`Chunk ${i + 1}/${totalChunks}:`, response.data);
        } catch (error) {
            console.error(`Failed to upload chunk ${i + 1}:`, error.response?.data || error.message);
        }
    }
});
