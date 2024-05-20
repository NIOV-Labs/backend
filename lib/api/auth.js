const Auth = require('../../utils/auth');
const auth = new Auth();

function addRoutes(app, evm) {
    app
        .route('/api/login')
        .post((req, res, next) => {
                console.log('Testing Login:');
                console.log('Received POST /api/login');
                auth.sigValidation(req, res, next);
            },
            (req, res) => {
                console.log('Handling login');
                auth.handleLogin(req, res);
            }
        )
        .patch((req, res, next) => {
                console.log('Received PATCH /api/login');
                auth.rtknValidation(req, res, next);
            },
            (req, res) => {
                console.log('Handling token refresh');
                auth.handleLogin(req, res);
            }
        )
        .delete((req, res, next) => {
                console.log('Received DELETE /api/login');
                auth.rtknValidation(req, res, next);
            },
            (req, res) => {
                console.log('Handling logout');
                auth.handleLogout(req, res);
            }
        );
	
	app
		.route('/api/balance/:alias')
		.get(
			(req, res, next) => {
				console.log(`Testing Get Balance:`);
				console.log(`Received GET /api/balance/${req.params.alias}`);
				auth.atknValidation(req, res, next);
			},
			(req, res) => {
				console.log(`Handling showBalance for alias: ${req.params.alias}`);
				evm.showBalance(req, res);
			}
		)
		.post(
			(req, res, next) => {
				console.log(`Received POST /api/balance/${req.params.alias}`);
				auth.atknValidation(req, res, next);
			},
			(req, res) => {
				console.log(`Handling sendBalance for alias: ${req.params.alias}`);
				evm.sendBalance(req, res);
			}
		);
}

module.exports = { addRoutes };
