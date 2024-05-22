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

            const abtContract = getABT(network);
            await (await abtContract.mintTo(user_address)).wait();
            const inventory = await abtContract.inventoryOf(user_address);
            const tokenId = parseInt(inventory[inventory.length - 1]);

            metadata.onChainID = tokenId;

            const newToken = new Token(metadata);
            console.log(newToken);
            await newToken.save();
            console.log(newToken);
            res.json({ tokenId });
        } catch (error) {
            res.status(400).send(error);
        }
    })
    .get(async (req, res) => {
        console.log('GET TOKEN');
        try {
            const tokenId = Number(req.params.tokenId);
            const token = await Token.findOne({ onChainID: tokenId });
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
    .get(async (req, res) => {
        console.log('GET METADATA FOR TOKENS');
        let tokenIds = req.query.tokenIds;
        
        if (!Array.isArray(tokenIds)) {
            if (typeof tokenIds === 'string') {
                tokenIds = [tokenIds];
            } else {
                return res.status(400).send('tokenIds should be an array');
            }
        }

        try {
          const tokens = await Token.find({ onChainID: { $in: tokenIds.map(id => Number(id)) } });
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
