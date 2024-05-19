const fs = require('fs');

function initUploadDir() {
	if (!fs.existsSync('./uploads')) {
		fs.mkdirSync('./uploads', {
			recursive: true,
		});
	}
}

module.exports = { initUploadDir };
