const { ProceedsWithdrawn, ListingClosed } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');

async function getTimestamp(socket, event) {
	try {
		const { blockNumber } = event.log;
		const block = await socket.getBlock(blockNumber);
		return block.timestamp;
	} catch (err) {
		console.error(`EventListener@getTimestamp`, err);
		return false;
	}
}

async function storeData(model, eName, data) {
	try {
		const { transactionHash } = data;
		const exists = await model.findOne({ transactionHash });
		if (exists) return;
		const newData = new model(data);
		await newData.save();
		console.log(`${eName}!`, newData);
		return true;
	} catch (err) {
		console.error(`EventListener@MongoDB ${eName}:`, err);
		return false;
	}
}

const proceedsListener = async (contract, chainId, socket) => {
	const eName = 'ProceedsWithdrawn';
	contract.on(eName, async (usdPennyValue, rawValue, seller, event) => {
		// console.log(event);
		const { transactionHash } = event.log;
		const timestamp = await getTimestamp(socket, event);

		await storeData(ProceedsWithdrawn, eName, {
			timestamp: new Date(timestamp * 1000),
			// txHash should go here
			// chainId should go here
			sellerAddress: seller.toLowerCase(), // why toLowerCase()?
			rawValue: parseInt(rawValue),
			usdPennyValue: parseInt(usdPennyValue),
			transactionHash,
			chainId,
		});
	});
};

const salesListener = async (contract, chainId, socket) => {
	const eName = 'ListingClosed';
	contract.on(
		eName,
		async (
			buyer,
			nftAddress,
			tokenId,
			usdPennyValue,
			paymentMethodAddress,
			rawValue,
			seller,
			event
		) => {
			// console.log(event);
			const { transactionHash } = event.log;
			const timestamp = await getTimestamp(socket, event);

			await storeData(ListingClosed, eName, {
				timestamp: new Date(timestamp * 1000),
				// txHash should go here
				// chainId should go here
				sellerAddress: seller.toLowerCase(), // why toLowerCase()?
				buyerAddress: buyer.toLowerCase(),
				nftAddress: nftAddress.toLowerCase(),
				tokenId: parseInt(tokenId),
				paymentMethodAddress: paymentMethodAddress.toLowerCase(),
				rawValue: parseInt(rawValue),
				usdPennyValue: parseInt(usdPennyValue),
				transactionHash,
				chainId,
			});
		}
	);
};

const reconnect = (evm) => {
	console.log('Attempting to reconnect in 5 seconds...');
	setTimeout(async () => {
		console.log('Reconnecting...');
		await setupListeners(evm);
	}, 5000);
};

async function setupListeners(evm) {
	// use fs to read the deploymentMap dir and use that to figure out
	// which chains have contracts deployed
	const networks = [
		// 31337, // localhost
		11155111, // sepolia
		80002, // amoy || could not coalesce error
		2442, // cardona || could not coalesce error
	];

	let sockets = {};
	networks.forEach(
		(chainId) =>
			(sockets[chainId] =
				evm.network.websocket(chainId) || evm.network.provider(chainId))
	);

	for await (const chainId of networks) {
		const socket = sockets[chainId];
		const market = contracts.retrieve('NiovMarket', chainId, socket);
		await proceedsListener(market, chainId, socket);
		await salesListener(market, chainId, socket);
	}
}

module.exports = { setupListeners };
