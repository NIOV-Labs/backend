const { Token, ProceedsWithdrawn, ListingClosed } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');
const fs = require('fs');
const path = require('path');

function addRoutes(app, evm) {
	function getABT(chainId) {
		return contracts.retrieve(
			'AssetBoundToken',
			chainId,
			evm.network.signer(chainId)
		);
	}

	function saveTmpFile(fileName, tokenId, network) {
		const tmpPrefix = 'tmp_';
		const uploadsDir = './uploads/';
		const networkTokenDir = path.join(uploadsDir, network.toString(), tokenId.toString());
		const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

		if (!fs.existsSync(networkTokenDir)) {
			fs.mkdirSync(networkTokenDir, { recursive: true }); // Ensure the directory is created recursively
		}

        const urlPrefix = process.env.BASE_URL + '/api/uploads/';
        console.log(fileName);
		const relativeFileName = fileName.replace(urlPrefix, '');
		const baseName = relativeFileName.replace(tmpPrefix, '').replace(path.extname(relativeFileName), '');
        console.log(baseName);

		extensions.forEach((ext) => {
			const tmpFileName = `${tmpPrefix}${baseName}${ext}`;
			const filePath = path.join(uploadsDir, tmpFileName);
			const newFileName = `${baseName}${ext}`;
			const newFilePath = path.join(networkTokenDir, newFileName);

			if (fs.existsSync(filePath)) {
				fs.renameSync(filePath, newFilePath);
				console.log(`Moved file ${filePath} to ${newFilePath}`);
			} else {
				console.log(`File not found: ${filePath}`);
			}
		});

		// Return the path of the main file with its new directory (assumed to be the first found file)
		return path.join(network.toString(), tokenId.toString(), `${baseName}${path.extname(relativeFileName)}`);
	}

	app
		.route('/api/token/:tokenId')
		.post(async (req, res) => {
			console.log('POST TOKEN');
			const { user_address, network, metadata } = req.body;
			console.log({ user_address, network, metadata });
			try {
				const abtContract = getABT(network);
				await (await abtContract.mintTo(user_address)).wait();
				const inventory = await abtContract.inventoryOf(user_address);
				const tokenId = parseInt(inventory[inventory.length - 1]);

				metadata.images = metadata.images.map((image) =>
					saveTmpFile(image, tokenId, network)
				);
				metadata.document1 = saveTmpFile(metadata.document1, tokenId, network);
				metadata.document2 = saveTmpFile(metadata.document2, tokenId, network);

				metadata.onChainID = tokenId;
				metadata.chainId = network;

				const newToken = new Token(metadata);
				await newToken.save();
				console.log(newToken);
				res.json({ tokenId });
			} catch (error) {
				res.status(400).send(error);
			}
		})
		.get(async (req, res) => {
			console.log('GET TOKEN');
			const { tokenId } = req.params;
			const { chainId } = req.query; // Extract chainId from query parameters

			try {
				const token = await Token.findOne({
					onChainID: tokenId,
					chainId: chainId,
				}); // Filter by chainId
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
				const tokenId = Number(req.params.tokenId);
				const token = await Token.findOneAndUpdate(
					{ onChainID: tokenId },
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

	app
		.route('/api/tokens')
		.get(async (req, res) => {
			console.log('GET METADATA FOR TOKENS');
			let { tokenIds, chainId } = req.query; // Extract chainId from query parameters

			console.log(chainId);
			if (!Array.isArray(tokenIds)) {
				if (typeof tokenIds === 'string') {
					tokenIds = [tokenIds];
				} else {
					return res.status(400).send('tokenIds should be an array');
				}
			}

			try {
				const tokens = await Token.find({
					onChainID: { $in: tokenIds.map((id) => Number(id)) },
					chainId: chainId,
				});
				res.send(tokens);
			} catch (error) {
				res.status(500).send(error);
			}
		})
		.delete(async (req, res) => {
			console.log('DELETE ALL TOKENS AND CLEAR UPLOADS FOLDER');
			try {
				// Delete all tokens from the database
                await Token.deleteMany({ chainId: 31337 });
                await ProceedsWithdrawn.deleteMany({ chainId: 31337 });
                await ListingClosed.deleteMany({ chainId: 31337 });

				// Clear the uploads folder
				const uploadDir = path.join(__dirname, '../../uploads');
				fs.readdir(uploadDir, (err, files) => {
					if (err) {
						console.error('Failed to read uploads directory:', err);
						return res.status(500).send('Server error');
					}

					files.forEach((file) => {
						const filePath = path.join(uploadDir, file);
						fs.stat(filePath, (err, stats) => {
							if (err) {
								console.error(`Failed to get stats of file: ${filePath}`, err);
								return;
							}

							if (stats.isDirectory()) {
								fs.rm(filePath, { recursive: true }, (err) => {
									if (err) {
										console.error(`Failed to delete folder: ${filePath}`, err);
									} else {
										console.log(`Deleted folder: ${filePath}`);
									}
								});
							} else {
								fs.unlink(filePath, (err) => {
									if (err) {
										console.error(`Failed to delete file: ${filePath}`, err);
									} else {
										console.log(`Deleted file: ${filePath}`);
									}
								});
							}
						});
					});

					console.log('All tokens and uploads deleted successfully.');
					res.send('All tokens and uploads deleted successfully.');
				});
			} catch (error) {
				console.error('Error deleting tokens and clearing uploads:', error);
				res.status(500).send('Server error');
			}
		});
}

module.exports = { addRoutes };
