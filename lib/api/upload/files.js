const fs = require('fs');
const path = require('path');
const { Poppler } = require('node-poppler');

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
    
	const filePath = `./uploads/${fileName}`;
    const jpegPath = filePath.replace('.pdf', '.jpg');

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }

    if (fs.existsSync(jpegPath)) {
        fs.unlinkSync(jpegPath);
        console.log(`Deleted: ${jpegPath}`);
    } else {
        console.log(`File not found: ${jpegPath}`);
    }

    if (fs.existsSync(pathTo.tmp)) fs.unlinkSync(pathTo.tmp);
    if (fs.existsSync(pathTo.prev)) fs.unlinkSync(pathTo.prev);
    if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
    if (fs.existsSync(pathTo.zip)) fs.unlinkSync(pathTo.zip);

    const allDeleted = !fs.existsSync(pathTo.tmp) && !fs.existsSync(pathTo.prev) && !fs.existsSync(pathTo.trash) && !fs.existsSync(pathTo.zip);
    const response = allDeleted ? 'success' : 'failed/deletion';
    res.json(response);
}

async function convertPdfToJpeg(pdfPath, outputJpegPath) {
    const poppler = new Poppler();

    const options = {
        jpegFile: true,
        singleFile: true, 
    };

    try {
        const outputDir = path.dirname(outputJpegPath);
        const outputBase = path.basename(outputJpegPath, path.extname(outputJpegPath));
        const outputPattern = path.join(outputDir, `${outputBase}`);

        await poppler.pdfToCairo(pdfPath, outputPattern, options);

        if (fs.existsSync(outputPattern)) {
            fs.renameSync(outputPattern, outputJpegPath);
            console.log(`Converted first page of PDF to JPEG: ${outputJpegPath}`);
        } else {
            console.error('No images were generated.');
        }
    } catch (error) {
        console.error('Error converting PDF to JPEG:', error);
    }
}

module.exports = {
    uploadPaths,
    uploadLabels,
    decomposeFile,
    deleteFiles,
	convertPdfToJpeg
};
