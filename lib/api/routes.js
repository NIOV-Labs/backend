function addRoutes(app, evm) {
	app.route('/api/sitrep').get((req, res) => evm.report(req, res));
	require('./token.js').addRoutes(app, evm);
	require('./auth.js').addRoutes(app, evm);
	require('./upload/index.js').addRoutes(app);
	require('./marketplaceData.js').addRoutes(app);

	// require('./devtools.js').addRoutes(app);

	require('./listeners.js')
		.setupListeners(evm)
		.then(() => {
			console.log('Listeners have been set up');
		})
		.catch((error) => {
			console.error(`Failed to set up listeners: ${error.message}`);
		});
}

module.exports = { addRoutes };
