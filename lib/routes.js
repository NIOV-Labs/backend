function addRoutes(app, evm) {
	require('./api/routes.js').addRoutes(app, evm);
}

module.exports = { addRoutes };
