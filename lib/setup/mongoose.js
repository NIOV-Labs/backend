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
	image: { type: String, required: true },
	document: { type: String, required: true },
	onChainID: { type: Number, required: true }
});
// TokenSchema.plugin(require('mongoose-encryption'), {
// 	secret: process.env.DB_KEY,
// 	encryptedFields: ['whatever you want tbh'],
// });
const Token = mongoose.model('Token', TokenSchema);

module.exports = { connectDatabase, Token };
