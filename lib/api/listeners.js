const { ProceedsWithdrawn, ListingClosed } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');

const getTimestamp = async (evm, chainId, event) => {
	const block = await evm.network
		.provider(chainId)
		.getBlock(event.log.blockNumber);
	return new Date(block.timestamp * 1000);
};

function getContract(name, chainId, evm) {
	return contracts.retrieve(name, chainId, evm.network.signer(chainId));
}

const proceedsListener = async (contract, chainId, evm) => {
	contract.on(
		'ProceedsWithdrawn',
		async (usdPennyValue, rawValue, seller, event) => {
			try {
				const { transactionHash } = event.log;
				const exists = await ProceedsWithdrawn.findOne({
					transactionHash,
				});
				if (exists) return;
				else console.log(event);

				const timestamp = await getTimestamp(evm, chainId, event);

				// why toLowerCase()?
				const newProceeds = new ProceedsWithdrawn({
					timestamp,
					sellerAddress: seller.toLowerCase(),
					rawValue: parseInt(rawValue),
					usdPennyValue: parseInt(usdPennyValue),
					transactionHash,
					chainId,
				});

				await newProceeds.save();
				console.log('ProceedsWithdrawn!', newProceeds);
			} catch (error) {
				console.error('ListenerError @ProceedsWithdrawn', error);
			}
		}
	);
};

const salesListener = async (contract, chainId, evm) => {
	contract.on(
		'ListingClosed',
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
			try {
				const { transactionHash } = event.log;
				const exists = await ProceedsWithdrawn.findOne({
					transactionHash,
				});
				if (exists) return;
				else console.log(event);

				const timestamp = await getTimestamp(evm, chainId, event);

				// why toLowerCase()?
				const newListing = new ListingClosed({
					timestamp,
					sellerAddress: seller.toLowerCase(),
					buyerAddress: buyer.toLowerCase(),
					nftAddress: nftAddress.toLowerCase(),
					tokenId: parseInt(tokenId),
					paymentMethodAddress: paymentMethodAddress.toLowerCase(),
					rawValue: parseInt(rawValue),
					usdPennyValue: parseInt(usdPennyValue),
					transactionHash,
					chainId,
				});
				await newListing.save();
				console.log('ListingClosed!', newListing);
			} catch (error) {
				console.error('ListenerError @ListingClosed', error);
			}
		}
	);
};

async function setupListeners(evm) {
	// use fs to read the deploymentMap dir and use that to figure out
	// which chains have contracts deployed
	const networks = [
		31337, // localhost
		11155111, // sepolia
		// 80002, // amoy || could not coalesce error
		// 2442,	// cardona || could not coalesce error
		// https://docs.chainstack.com/docs/understanding-ethereums-filter-not-found-error-and-how-to-fix-it#:~:text=The%20%22Filter%20Not%20Found%22%20error%20often%20occurs%20when%20there%20is,Ethereum%20(Geth)%20GitHub%20page.
	];

	for await (const network of networks) {
		const contract = getContract('NiovMarket', network, evm);
		await proceedsListener(contract, network, evm);
		await salesListener(contract, network, evm);
	}
}

module.exports = { setupListeners };
