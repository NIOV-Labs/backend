const { ProceedsWithdrawn, ListingClosed } = require('../setup/mongoose');
const contracts = require('../../utils/evm/contract');

function getContract(name, chainId, evm) {
    return contracts.retrieve(name, chainId, evm.network.signer(chainId));
}

async function setupListeners(evm) {
    const network = 31337;
    const contract = getContract('NiovMarket', network, evm); 

    // Listen for ProceedsWithdrawn events
    contract.on('ProceedsWithdrawn', async (usdPennyValue, rawValue, seller, event) => {
        try {
            const existingEvent = await ProceedsWithdrawn.findOne({ transactionHash: event.log.transactionHash });
            if (existingEvent) {
                console.log('Duplicate event detected. Skipping...');
                return;
            }
            console.log(event);
            const block = await evm.network.provider(network).getBlock(event.log.blockNumber);
            const timestamp = new Date(block.timestamp * 1000);
            
            const newProceeds = new ProceedsWithdrawn({
                sellerAddress: seller.toLowerCase(),
                rawValue: rawValue.toString(),
                usdPennyValue: usdPennyValue.toString(),
                timestamp: timestamp,
                transactionHash: event.log.transactionHash
            });
            await newProceeds.save();
            console.log('ProceedsWithdrawn event logged:', newProceeds);
        } catch (error) {
            console.error('Error processing ProceedsWithdrawn event:', error);
        }
    });

    // Listen for ListingClosed events
    contract.on('ListingClosed', async (buyer, nftAddress, tokenId, usdPennyValue, paymentMethodAddress, rawValue, seller, event) => {
        try {
            const existingEvent = await ProceedsWithdrawn.findOne({ transactionHash: event.log.transactionHash });
            if (existingEvent) {
                console.log('Duplicate event detected. Skipping...');
                return;
            }
            const block = await evm.network.provider(network).getBlock(event.log.blockNumber);
            const timestamp = new Date(block.timestamp * 1000);
            
            const newListing = new ListingClosed({
                sellerAddress: seller.toLowerCase(),
                buyerAddress: buyer,
                nftAddress: nftAddress,
                tokenId: tokenId.toString(),
                paymentMethodAddress: paymentMethodAddress,
                rawValue: rawValue.toString(),
                usdPennyValue: usdPennyValue.toString(),
                timestamp: timestamp,
                transactionHash: event.log.transactionHash
            });
            await newListing.save();
            console.log('ListingClosed event logged:', newListing);
        } catch (error) {
            console.error('Error processing ListingClosed event:', error);
        }
    });
}

module.exports = { setupListeners };
