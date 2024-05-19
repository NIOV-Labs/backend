function initApp() {
	require('./dirs.js').initUploadDir();
	require('./mongoose.js').connectDatabase();
	const app = require('./app.js').configureApp();
	return app;
}

module.exports = { initApp };
