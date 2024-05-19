const fs = require('fs');

const uploadPaths = (fileName) => {
	return `./uploads/${fileName}`;
};

function uploadLabels(ext, string1, string2) {
	const temp = tempLabel(ext, string1, string2);
	const cached = cachedLabel(ext, string1);

	const allLabels = {
		tmp: temp.label,
		prev: cached.preview,
		trash: cached.garbage,
		zip: cached.archive,
	};

	// console.log(allLabels);
	return allLabels;
}

function decomposeFile(chunk, chunkIndex, totalChunks) {
	const chunkIdx = parseInt(chunkIndex);
	const chunkNum = chunkIdx + 1;
	const chunkTotal = parseInt(totalChunks);
	const percentProgress = (chunkNum / chunkTotal) * 100;
	const isFirstChunk = chunkIdx === 0 && chunkNum === 1;
	const isLastChunk = chunkIdx === chunkTotal - 1 && chunkNum === chunkTotal;

	const chunkData = chunk.split(',')[1];
	const chunkBuffer = Buffer.from(chunkData, 'base64');

	const decomposed = {
		idx: chunkIdx,
		num: chunkNum,
		tot: chunkTotal,

		isFirst: isFirstChunk,
		isLast: isLastChunk,

		percent: percentProgress,

		contents: chunkBuffer,
	};
	return decomposed;
}

function deleteFiles(fileName, route, res) {
	console.log('Deletion requested...');
	if (fileName === undefined)
		res.json(`err: fileName undefined @ app.delete('/deaddrop/${route}')`);
	// file, trash, zip
	const pathTo = uploadedPaths(uploadedLabels(fileName));

	if (fs.existsSync(pathTo.file)) fs.unlinkSync(pathTo.file);

	if (!isTemp(fileName)) {
		if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
		if (fs.existsSync(pathTo.zip)) fs.unlinkSync(pathTo.zip);
	}

	const allDeleted =
		!fs.existsSync(pathTo.file) &&
		!fs.existsSync(pathTo.trash) &&
		!fs.existsSync(pathTo.zip);

	const response = !allDeleted ? 'failed/deletion' : 'success';
	res.json(response);
}

module.exports = {
	uploadPaths,
	uploadLabels,
	decomposeFile,
	deleteFiles,
};
