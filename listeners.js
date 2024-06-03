const { ProceedsWithdrawn, ListingClosed } = require('./lib/setup/mongoose');
const contracts = require('./utils/evm/contract');

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
		console.log(`${eName}!`, data);
		const newData = new model(data);
		console.log('|||| saving...');
		await newData.save();
		console.log('|||| saved!');
		return true;
	} catch (err) {
		console.error(`EventListener@MongoDB ${eName}:`, err);
		return false;
	}
}

const proceedsListener = (market, chainId, socket) => {
	const eName = 'ProceedsWithdrawn';
	market.on(eName, async (usdPennyValue, rawValue, seller, event) => {
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

const salesListener = (market, chainId, socket) => {
	const eName = 'ListingClosed';
	market.on(
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

function startListeners(evm, chainId) {
	let provider = evm.network.websocket(chainId);

	// Keep Connection Alive
	provider.websocket.on('open', () => {
		console.log(`Socket(${chainId}): opened`);
		// Send a ping every 30 seconds to keep the connection alive
		setInterval(() => {
			if (provider.websocket.readyState === 1) {
				console.log(`Socket(${chainId}): pulse`);
				provider.websocket.send(JSON.stringify({ method: 'ping' }));
			}
		}, 30000); // 30 seconds
	});

	// Revive Connection
	function reconnect() {
		// Attempt to reconnect after 5 seconds
		const reconnectInterval = 5000; // 5 seconds
		setTimeout(() => {
			console.log(`|| Socket(${chainId}): Reconnecting...`);
			startListeners(evm, chainId);
		}, reconnectInterval);
	}
	provider.websocket.on('close', () => {
		console.log(`Socket(${chainId}): closed'`);
		reconnect();
	});
	provider.websocket.on('error', (err) => {
		console.error(`'Socket(${chainId}): crashed - error:`, err);
		provider.websocket.close();
		reconnect();
	});

	const market = contracts.retrieve('NiovMarket', chainId, provider);
	proceedsListener(market, chainId, provider);
	salesListener(market, chainId, provider);

	// const abt = contracts.retrieve('AssetBoundToken', chainId, provider);
}

function setupListeners(evm) {
	// use fs to read the deploymentMap dir and use that to figure out
	// which chains have contracts deployed
	const networks = [
		// 31337, // localhost
		11155111, // sepolia
		80002, // amoy || could not coalesce error
		// 2442, // cardona || could not coalesce error
	];

	networks.forEach((chainId) => startListeners(evm, chainId));
}

module.exports = { setupListeners };
