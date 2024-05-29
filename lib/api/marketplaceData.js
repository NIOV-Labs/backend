const { ListingClosed, ProceedsWithdrawn } = require('../setup/mongoose');

function addRoutes(app) {
    console.log('Setting up /api/soldABTs route');
    app.route('/api/soldABTs')
        .get(async (req, res) => {
            const wallet = req.query.wallet;
            if (!wallet) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }

            try {
                const soldABTs = await ListingClosed.find({ sellerAddress: wallet });
                res.status(200).json({ soldABTs: soldABTs.length });
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch sold ABTs', details: error.message });
            }
        });

    console.log('Setting up /api/grossRevenue route');
    app.route('/api/grossRevenue')
        .get(async (req, res) => {
            const wallet = req.query.wallet;
            if (!wallet) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }

            try {
                const proceeds = await ProceedsWithdrawn.find({ sellerAddress: wallet });
                const grossRevenue = proceeds.reduce((acc, curr) => {
                    if (curr.usdPennyValue !== undefined && typeof curr.usdPennyValue === 'number') {
                        return acc + curr.usdPennyValue;
                    } else {
                        return acc;
                    }
                }, 0);
                res.status(200).json({ grossRevenue });
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch gross revenue', details: error.message });
            }
        });

    app.route('/api/marketplace')
        .delete(async (req, res) => {
            try {
                await ListingClosed.deleteMany({});
                await ProceedsWithdrawn.deleteMany({});
                res.status(200).json({ message: 'All entries in ListingClosed and ProceedsWithdrawn have been deleted' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete entries', details: error.message });
            }
        });
}

module.exports = { addRoutes };
