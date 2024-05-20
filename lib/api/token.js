const { Token } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');

function addRoutes(app, evm) {
	function getABT(chainId) {
		return contracts.retrieve(
			'AssetBoundToken',
			chainId,
			evm.network.signer(chainId)
		);
	}

	app
		.route('/api/token/:tokenId')
		.post(async (req, res) => {
			console.log('POST TOKEN');
			const { user_address, network, metadata } = req.body;
			console.log({ user_address, network, metadata });
			try {
				const newToken = new Token(metadata);
				await newToken.save();
				
				const abtContract = getABT(network);
				await (await abtContract.quickMint()).wait();
				const numTokens = parseInt(await abtContract.numTokens());
				await (
					await abtContract.transferFrom(
						evm.wallet.address,
						user_address,
						numTokens
					)
				).wait();
				res.json({ tokenId: numTokens });
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

    app
        .route('/api/tokens')
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
