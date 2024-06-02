require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.MONGO_URI;
function connectDatabase() {
	mongoose
		.connect(url) // (url, { keepAlive: true, keepAliveInitialDelay: 300000 })
		.then(() => console.log('Database Connection Established!'))
		.catch(async (err) => {
			console.log(err);
			await new Promise((resolve) => setTimeout(resolve, 5000));
			connectDatabase();
		});
}

const TokenSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	externalURL: { type: String, required: true },
	images: { type: [String], required: true },
	document1: { type: String, required: true },
	document2: { type: String, required: true },
	onChainID: { type: Number, required: true },
	chainID: { type: Number, required: true },
});

const ProceedsWithdrawnSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now },
	sellerAddress: { type: String, required: true },
	rawValue: { type: Number, required: true },
	usdPennyValue: { type: Number, required: true },
	transactionHash: { type: String, required: true },
	chainId: { type: Number, required: true },
});

const ListingClosedSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now },
	sellerAddress: { type: String, required: true },
	buyerAddress: { type: String, required: true },
	nftAddress: { type: String, required: true },
	tokenId: { type: Number, required: true },
	paymentMethodAddress: { type: String, required: true },
	rawValue: { type: Number, required: true },
	usdPennyValue: { type: Number, required: true },
	transactionHash: { type: String, required: true },
	chainId: { type: Number, required: true },
});

const Token = mongoose.model('Token', TokenSchema);
const ProceedsWithdrawn = mongoose.model(
	'ProceedsWithdrawn',
	ProceedsWithdrawnSchema
);
const ListingClosed = mongoose.model('ListingClosed', ListingClosedSchema);

module.exports = { connectDatabase, Token, ProceedsWithdrawn, ListingClosed };
