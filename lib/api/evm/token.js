const { Token } = require('../../setup/mongoose');
function addRoutes(app, evm) {
	app
		.route('/api/token/:tokenId')
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
		.post(async (req, res) => {
			const { user_address, network, metadata } = req.body;
			try {
				// const newToken = new Token(metadata);
				// await newToken.save();
				const abtContract = getABT(network);
				await (await abtContract.quickMint()).wait();
				let numTokens = parseInt(await abtContract.numTokens());
				await (
					await abtContract.transferFrom(
						evm.wallet.address,
						user_address,
						numTokens
					)
				).wait();
				res.sendStatus(200).send(numTokens);
			} catch (error) {
				res.status(400).send(error);
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
}

module.exports = { addRoutes };
