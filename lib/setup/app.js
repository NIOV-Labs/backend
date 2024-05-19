require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;
// const url = process.env.CLIENT_URL;
function configureApp() {
	const app = express();
	app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10gb' }));
	app.use(bodyParser.json({ limit: '50mb' }));
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));
	app.use(cors({ origin: '*' }));
	app.use('/uploads', express.static('uploads'));
	app.listen(port, () => {
		console.log('Server Started on Port:' + port);
	});
	return app;
}

module.exports = { configureApp };
