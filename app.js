require('dotenv').config();
const Evm = require('./utils/evm');
const evm = new Evm();
const app = require('./lib/setup/index.js').initApp();
require('./lib/routes.js').addRoutes(app, evm);

// const fs = require('fs');

// const multer = require('multer');
// const upload = multer();
// const md5 = require('md5');

// const Auth = require('./utils/auth');
// const contracts = require('./utils/evm/contract.js');

// const auth = new Auth();

// function getABT(chainId) {
// 	return contracts.retrieve(
// 		'AssetBoundToken',
// 		chainId,
// 		evm.network.signer(chainId)
// 	);
// }

// app
// 	.route('/api/login')
// 	.post(
// 		(req, res, next) => {
// 			console.log(`Testing Login:`);
// 			console.log('Received POST /api/login');
// 			auth.sigValidation(req, res, next);
// 		},
// 		(req, res) => {
// 			console.log('Handling login');
// 			auth.handleLogin(req, res);
// 		}
// 	)
// 	.patch(
// 		(req, res, next) => {
// 			console.log('Received PATCH /api/login');
// 			auth.rtknValidation(req, res, next);
// 		},
// 		(req, res) => {
// 			console.log('Handling token refresh');
// 			auth.handleLogin(req, res);
// 		}
// 	)
// 	.delete(
// 		(req, res, next) => {
// 			console.log('Received DELETE /api/login');
// 			auth.rtknValidation(req, res, next);
// 		},
// 		(req, res) => {
// 			console.log('Handling logout');
// 			auth.handleLogout(req, res);
// 		}
// 	);

// app
// 	.route('/api/balance/:alias')
// 	.get(
// 		(req, res, next) => {
// 			console.log(`Testing Get Balance:`);
// 			console.log(`Received GET /api/balance/${req.params.alias}`);
// 			auth.atknValidation(req, res, next);
// 		},
// 		(req, res) => {
// 			console.log(`Handling showBalance for alias: ${req.params.alias}`);
// 			evm.showBalance(req, res);
// 		}
// 	)
// 	.post(
// 		(req, res, next) => {
// 			console.log(`Received POST /api/balance/${req.params.alias}`);
// 			auth.atknValidation(req, res, next);
// 		},
// 		(req, res) => {
// 			console.log(`Handling sendBalance for alias: ${req.params.alias}`);
// 			evm.sendBalance(req, res);
// 		}
// 	);

// app.post('/upload', upload.none(), (req, res) => {
// 	const { ext, chunk, chunkIndex, totalChunks } = req.body;
// 	const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);

// 	const nameFor = uploadLabels(ext, req.ip, totalChunks);
// 	const pathTo = uploadPaths(nameFor);

// 	const shouldDelete = dataChunk.isFirst && fs.existsSync(pathTo.tmp);
// 	if (shouldDelete) fs.unlinkSync(pathTo.tmp);

// 	fs.appendFileSync(pathTo.tmp, dataChunk.contents);

// 	if (dataChunk.isLast) {
// 		fs.renameSync(pathTo.tmp, pathTo.prev);
// 		res.json({ finalName: nameFor.prev });
// 	} else {
// 		res.json({ tmpName: nameFor.tmp });
// 	}
// });

// function uploadLabels(ext, totalChunks) {
// 	const baseString = `${Date.now()}-${totalChunks}`;
// 	const hash = md5(baseString);
// 	const tempFileName = `tmp_${hash}.${ext}`;
// 	const finalFileName = `${hash}.${ext}`;

// 	return {
// 		tmp: tempFileName,
// 		prev: finalFileName,
// 	};
// }

// function uploadPaths(labels) {
// 	return {
// 		tmp: `./uploads/${labels.tmp}`,
// 		prev: `./uploads/${labels.prev}`,
// 	};
// }

// function decomposeFile(chunk, chunkIndex, totalChunks) {
// 	const chunkIdx = parseInt(chunkIndex, 10);
// 	const chunkNum = chunkIdx + 1;
// 	const chunkTotal = parseInt(totalChunks, 10);
// 	const percentProgress = (chunkNum / chunkTotal) * 100;
// 	const isFirstChunk = chunkIdx === 0;
// 	const isLastChunk = chunkIdx === chunkTotal - 1;

// 	const chunkData = chunk.split(',')[1];
// 	const chunkBuffer = Buffer.from(chunkData, 'base64');

// 	return {
// 		idx: chunkIdx,
// 		num: chunkNum,
// 		tot: chunkTotal,
// 		isFirst: isFirstChunk,
// 		isLast: isLastChunk,
// 		percent: percentProgress,
// 		contents: chunkBuffer,
// 	};
// }
