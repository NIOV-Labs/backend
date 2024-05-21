const { Token } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');
const fs = require('fs');

function addRoutes(app, evm) {
	function getABT(chainId) {
		return contracts.retrieve(
			'AssetBoundToken',
			chainId,
			evm.network.signer(chainId)
		);
	}

	function saveTmpFile(fileName) {
        const tmpPrefix = 'tmp_';
        const uploadsDir = './uploads/';
        const filePath = uploadsDir + fileName;
        if (fileName.startsWith(tmpPrefix)) {
            const newFileName = fileName.replace(tmpPrefix, '');
            const newFilePath = uploadsDir + newFileName;
            if (fs.existsSync(filePath)) {
                fs.renameSync(filePath, newFilePath);
                return newFileName;
            } else {
				console.log('File not found');
            }
        }
        return fileName;
    }

	app
		.route('/api/token/:tokenId')
		.post(async (req, res) => {
			console.log('POST TOKEN');
			const { user_address, network, metadata } = req.body;
			console.log({ user_address, network, metadata });
			try {
				if (metadata.image) {
					metadata.image = saveTmpFile(metadata.image);
				}
				if (metadata.document) {
					metadata.document = saveTmpFile(metadata.document);
				}

				const newToken = new Token(metadata);
				await newToken.save();

				const abtContract = getABT(network);
				await (await abtContract.mintTo(user_address)).wait();
				const inventory = await abtContract.inventoryOf(user_address);
				const tokenId = parseInt(inventory[inventory.length - 1]);
				res.json({ tokenId });
			} catch (error) {
				res.status(400).send(error);
			}
		})
		.get(async (req, res) => {
			console.log('GET TOKEN');
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
		});
	// .delete(async (req, res) => {
	// 	try {
	// 		const token = await Token.findByIdAndDelete(req.params.tokenId);
	// 		if (!token) {
	// 			return res.status(404).send('Token not found');
	// 		}
	// 		res.send({ message: 'Token deleted successfully' });
	// 	} catch (error) {
	// 		res.status(500).send(error);
	// 	}
	// });

	app.route('/api/tokens')
		.post(async (req, res) => {
			console.log('GET METADATA FOR TOKENS');
			const { tokenIds } = req.body;
			if (!Array.isArray(tokenIds)) {
				return res.status(400).send('tokenIds should be an array');
			}

			try {
				const tokens = await Token.find({ _id: { $in: tokenIds } });
				res.send(tokens);
			} catch (error) {
				res.status(500).send(error);
			}
		})
	  	.delete(async (req, res) => {
			console.log('DELETE ALL TOKENS');
			try {
				await Token.deleteMany({});
				res.send({ message: 'All tokens deleted successfully' });
			} catch (error) {
				res.status(500).send(error);
			}
		});
}

module.exports = { addRoutes };
