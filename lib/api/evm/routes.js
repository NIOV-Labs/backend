function addRoutes(app, evm) {
	app.route('/api/sitrep').get((req, res) => evm.report(req, res));
}

module.exports = { addRoutes };
