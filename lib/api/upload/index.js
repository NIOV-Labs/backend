const express = require('express');
const fs = require('fs');
const {
	uploadLabels,
	uploadPaths,
	decomposeFile,
	deleteFiles,
	convertPdfToJpeg,
} = require('./files.js');

function addRoutes(app) {
	app.use(express.json({ limit: '50mb' }));

	app
		.route('/api/upload')
		.post((req, res) => {
			console.log('Received POST request to /api/upload');
			try {
				const { ext, chunk, chunkIndex, totalChunks, baseName } = JSON.parse(
					req.body.toString()
				);
				console.log(
					`Parsed request: ext=${ext}, chunkIndex=${chunkIndex}, totalChunks=${totalChunks}, baseName=${baseName}`
				);

				const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);
				console.log(
					`Processing Chunk ${dataChunk.num} of ${dataChunk.total} || ${dataChunk.percent}%`
				);

				if (!baseName) {
					throw new Error('baseName is undefined');
				}

				const nameFor = { tmp: baseName, prev: baseName.replace('tmp_', '') };
				const pathTo = uploadPaths(nameFor);
				console.log(`Generated paths: tmp=${pathTo.tmp}, prev=${pathTo.prev}`);

				const shouldDelete = dataChunk.isFirst && fs.existsSync(pathTo.tmp);
				if (shouldDelete) {
					console.log(`Deleting existing temporary file: ${pathTo.tmp}`);
					fs.unlinkSync(pathTo.tmp);
				}
				fs.appendFileSync(pathTo.tmp, dataChunk.contents);
				console.log(`Appended data to ${pathTo.tmp}`);

				if (dataChunk.isLast) {
					console.log(`Renaming ${pathTo.tmp} to ${pathTo.prev}`);
					fs.renameSync(pathTo.tmp, pathTo.prev);

					const jpegPath = pathTo.prev.replace('.pdf', '.jpg');
					convertPdfToJpeg(pathTo.prev, jpegPath)
						.then(() => {
							console.log(`Converted first page of PDF to JPEG: ${jpegPath}`);
							res.json({ image: jpegPath, file: pathTo.prev });
						})
						.catch((err) => {
							console.error('Error converting PDF to JPEG:', err);
							res.status(500).send('Error converting PDF to JPEG');
						});
				} else {
					res.json({ tmpName: nameFor.tmp });
				}
			} catch (error) {
				console.error('Error processing request:', error);
				res.status(500).send('Server error');
			}
		})
		.delete((req, res) => {
			console.log('Received DELETE request to /api/upload');
			try {
				const { fileName } = req.body;
				console.log(`Parsed request for deletion: fileName=${fileName}`);
				deleteFiles(fileName, 'upload', res);
			} catch (error) {
				console.error('Error processing deletion request:', error);
				res.status(500).send('Server error');
			}
		});
}

module.exports = { addRoutes };
