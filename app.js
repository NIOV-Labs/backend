require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const md5 = require('md5');
const Evm = require('./utils/evm');
const Auth = require('./utils/auth');
const contracts = require('./utils/evm/contract.js');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

const evm = new Evm();
const auth = new Auth();

function getABT(chainId) {
	return contracts.retrieve(
		'AssetBoundToken',
		chainId,
		evm.network.signer(chainId)
	);
}

const mongoURI = process.env.MONGO_URI;
mongoose
	.connect(mongoURI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.log(err));

const TokenSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	externalURL: { type: String, required: true },
	image: { type: String, required: true },
	document: { type: String, required: true },
});
const Token = mongoose.model('Token', TokenSchema);

app.route('/api/sitrep').get((req, res) => evm.report(req, res));

app
	.route('/api/login')
	.post(
		(req, res, next) => {
			console.log(`Testing Login:`);
			console.log('Received POST /api/login');
			auth.sigValidation(req, res, next);
		},
		(req, res) => {
			console.log('Handling login');
			auth.handleLogin(req, res);
		}
	)
	.patch(
		(req, res, next) => {
			console.log('Received PATCH /api/login');
			auth.rtknValidation(req, res, next);
		},
		(req, res) => {
			console.log('Handling token refresh');
			auth.handleLogin(req, res);
		}
	)
	.delete(
		(req, res, next) => {
			console.log('Received DELETE /api/login');
			auth.rtknValidation(req, res, next);
		},
		(req, res) => {
			console.log('Handling logout');
			auth.handleLogout(req, res);
		}
	);

app
	.route('/api/balance/:alias')
	.get(
		(req, res, next) => {
			console.log(`Testing Get Balance:`);
			console.log(`Received GET /api/balance/${req.params.alias}`);
			auth.atknValidation(req, res, next);
		},
		(req, res) => {
			console.log(`Handling showBalance for alias: ${req.params.alias}`);
			evm.showBalance(req, res);
		}
	)
	.post(
		(req, res, next) => {
			console.log(`Received POST /api/balance/${req.params.alias}`);
			auth.atknValidation(req, res, next);
		},
		(req, res) => {
			console.log(`Handling sendBalance for alias: ${req.params.alias}`);
			evm.sendBalance(req, res);
		}
	);

app
	.route('/api/token/:tokenId')
	.post(async (req, res) => {
		const { user_address, network, metadata } = req.body;
		try {
			const newToken = new Token(metadata);
			await newToken.save();
			const abtContract = getABT(network);
			const numTokens = await abtContract.quickMint();
			await abtContract.transferFrom(
				evm.wallet.address,
				user_address,
				numTokens
			);
			res.status(201).send(numTokens);
		} catch (error) {
			res.status(400).send(error);
		}
	})
	.get(async (req, res) => {
		try {
			const token = await Token.findOne({ _id: req.params.tokenId });
			if (!token) {
				return res.status(404).send('Token not found');
			}
			res.send(token);
		} catch (error) {
			res.status(500).send(error);
		}
	})
	.put(async (req, res) => {
		try {
			const updates = req.body;
			const options = { new: true };
			const token = await Token.findByIdAndUpdate(
				req.params.tokenId,
				updates,
				options
			);
			if (!token) {
				return res.status(404).send('Token not found');
			}
			res.send(token);
		} catch (error) {
			res.status(400).send(error);
		}
	})
	.delete(async (req, res) => {
		try {
			const token = await Token.findByIdAndDelete(req.params.tokenId);
			if (!token) {
				return res.status(404).send('Token not found');
			}
			res.send({ message: 'Token deleted successfully' });
		} catch (error) {
			res.status(500).send(error);
		}
	});

app.post('/upload', upload.none(), (req, res) => {
	const { ext, chunk, chunkIndex, totalChunks } = req.body;
	const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);

	const nameFor = uploadLabels(ext, req.ip, totalChunks);
	const pathTo = uploadPaths(nameFor);

	const shouldDelete = dataChunk.isFirst && fs.existsSync(pathTo.tmp);
	if (shouldDelete) fs.unlinkSync(pathTo.tmp);

	fs.appendFileSync(pathTo.tmp, dataChunk.contents);

	if (dataChunk.isLast) {
		fs.renameSync(pathTo.tmp, pathTo.prev);
		res.json({ finalName: nameFor.prev });
	} else {
		res.json({ tmpName: nameFor.tmp });
	}
});

function uploadLabels(ext, totalChunks) {
	const baseString = `${Date.now()}-${totalChunks}`;
	const hash = md5(baseString);
	const tempFileName = `tmp_${hash}.${ext}`;
	const finalFileName = `${hash}.${ext}`;

	return {
		tmp: tempFileName,
		prev: finalFileName,
	};
}

function uploadPaths(labels) {
	return {
		tmp: `./uploads/${labels.tmp}`,
		prev: `./uploads/${labels.prev}`,
	};
}

function decomposeFile(chunk, chunkIndex, totalChunks) {
	const chunkIdx = parseInt(chunkIndex, 10);
	const chunkNum = chunkIdx + 1;
	const chunkTotal = parseInt(totalChunks, 10);
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
		contents: chunkBuffer,
	};
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
