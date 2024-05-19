function addRoutes(app, evm) {
	app.route('/api/sitrep').get((req, res) => evm.report(req, res));
	require('./token.js').addRoutes(app, evm);
	require('./upload/index.js').addRoutes(app);
}

module.exports = { addRoutes };
