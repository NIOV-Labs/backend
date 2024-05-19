require('dotenv').config();
// const fs = require('fs');

function addRoutes(app, evm) {
	require('./evm/routes.js').addRoutes(app, evm);
}

module.exports = { addRoutes };
