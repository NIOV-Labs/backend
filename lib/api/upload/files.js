const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const { createCanvas } = require('canvas');

const uploadPaths = (labels) => ({
    tmp: `./uploads/${labels.tmp}`,
    prev: `./uploads/${labels.prev}`,
});

function tempLabel(ext, ip, totalChunks) {
    const timestamp = Date.now();
    const tempFileName = `tmp_${timestamp}_${ip}_${totalChunks}.${ext}`;
    return {
        label: tempFileName
    };
}

function cachedLabel(ext, ip) {
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${ip}.${ext}`;
    return {
        preview: finalFileName,
        garbage: `trash_${finalFileName}`,
        archive: `archive_${finalFileName}`
    };
}

function uploadLabels(ext, ip, totalChunks) {
    const temp = tempLabel(ext, ip, totalChunks);
    const cached = cachedLabel(ext, ip);

    return {
        tmp: temp.label,
        prev: cached.preview,
        trash: cached.garbage,
        zip: cached.archive
    };
}

function decomposeFile(chunk, chunkIndex, totalChunks) {
    const chunkIdx = parseInt(chunkIndex);
    const chunkNum = chunkIdx + 1;
    const chunkTotal = parseInt(totalChunks);
    const percentProgress = (chunkNum / chunkTotal) * 100;
    const isFirstChunk = chunkIdx === 0;
    const isLastChunk = chunkIdx === chunkTotal - 1;

    const chunkData = chunk.split(',')[1];
    const chunkBuffer = Buffer.from(chunkData, 'base64');

    return {
        idx: chunkIdx,
        num: chunkNum,
        tot: chunkTotal,
        isFirst: isFirstChunk,
        isLast: isLastChunk,
        percent: percentProgress,
        contents: chunkBuffer
    };
}

function deleteFiles(fileName, route, res) {
    console.log('Deletion requested...');
    if (!fileName) {
        return res.json(`err: fileName undefined @ app.delete('/${route}')`);
    }

    const pathTo = uploadPaths(uploadLabels(fileName));
    
    if (fs.existsSync(pathTo.tmp)) fs.unlinkSync(pathTo.tmp);
    if (fs.existsSync(pathTo.prev)) fs.unlinkSync(pathTo.prev);
    if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
    if (fs.existsSync(pathTo.zip)) fs.unlinkSync(pathTo.zip);

    const allDeleted = !fs.existsSync(pathTo.tmp) && !fs.existsSync(pathTo.prev) && !fs.existsSync(pathTo.trash) && !fs.existsSync(pathTo.zip);
    const response = allDeleted ? 'success' : 'failed/deletion';
    res.json(response);
}

async function convertPdfToJpeg(pdfPath, outputJpegPath) {
    const pdfData = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfData);

    const data = await pdfParse(pdfData);
    const firstPageText = data.text.split('\n').slice(0, 35).join('\n'); 

    const { width, height } = pdfDoc.getPage(0).getSize();
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const padding = 20; 
    const lineHeight = 20; 
    const paragraphPadding = 10; 
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'black';
    context.font = '16px Arial';
    const lines = firstPageText.split('\n');
    let yOffset = padding;

    lines.forEach((line, index) => {
        context.fillText(line, padding, yOffset);
        yOffset += lineHeight;

        if (line.trim() === '') {
            yOffset += paragraphPadding;
        }
    });

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputJpegPath, buffer);
    console.log(`Converted first page of PDF to JPEG: ${outputJpegPath}`);
}

module.exports = {
    uploadPaths,
    uploadLabels,
    decomposeFile,
    deleteFiles,
	convertPdfToJpeg
};
