const fs = require('fs');
const {
	uploadLabels,
	uploadPaths,
	decomposeFile,
	deleteFiles,
} = require('./files.js');

function addRoutes(app) {
	app
		.route('/api/upload')
		.post((req, res) => {
			const { ext, chunk, chunkIndex, totalChunks } = JSON.parse(
				req.body.toString()
			);
			// idx, num, tot, isFirst, isLast, percent, contents
			const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);
			console.log(
				`Getting Chunk ${dataChunk.num} of ${dataChunk.total} || ${dataChunk.percent}%`
			);

			// tmp, prev, trash, zip
			const nameFor = uploadLabels(ext, req.ip, totalChunks);
			const pathTo = uploadPaths(nameFor);

			const shouldDelete = dataChunk.isFirst && fs.existsSync(pathTo.tmp);
			if (shouldDelete === true) fs.unlinkSync(pathTo.tmp);
			fs.appendFileSync(pathTo.tmp, dataChunk.contents);

			if (dataChunk.isLast) {
				fs.renameSync(pathTo.tmp, pathTo.prev);
				res.json({ finalName: nameFor.prev });
			} else res.json({ tmpName: nameFor.tmp });
		})
		.delete((req, res) => {
			deleteFiles(req.body.fileName, 'upload', res);
		});
}

module.exports = { addRoutes };
