const express = require('express');
const fs = require('fs');
const path = require('path');
const { ListingClosed, ProceedsWithdrawn } = require('../setup/mongoose');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const EXPIRE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

function scheduleFileDeletion(filePath) {
    console.log(`Set Temporary File: ${filePath}`);
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Temporary file deleted: ${filePath}`);
        }
    }, EXPIRE_TIME);
}

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

    console.log('Setting up /api/marketplace route');
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

    console.log('Setting up /api/exportMarketplaceData route');
    app.route('/api/exportMarketplaceData')
        .get(async (req, res) => {
            const wallet = req.query.wallet;
            if (!wallet) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }

            try {
                const listings = await ListingClosed.find({ sellerAddress: wallet });
                const proceeds = await ProceedsWithdrawn.find({ sellerAddress: wallet });

                const fileName = `export_${Date.now()}_${wallet}.csv`;
                const filePath = path.resolve(__dirname, `../../uploads/${fileName}`);

                const csvWriter = createCsvWriter({
                    path: filePath,
                    header: [
                        { id: 'timestamp', title: 'Timestamp' },
                        { id: 'sellerAddress', title: 'Seller Address' },
                        { id: 'buyerAddress', title: 'Buyer Address' },
                        { id: 'nftAddress', title: 'NFT Address' },
                        { id: 'tokenId', title: 'Token ID' },
                        { id: 'paymentMethodAddress', title: 'Payment Method Address' },
                        { id: 'rawValue', title: 'Raw Value' },
                        { id: 'usdPennyValue', title: 'USD Penny Value' },
                        { id: 'proceeds_sellerAddress', title: 'Proceeds Seller Address' },
                        { id: 'proceeds_rawValue', title: 'Proceeds Raw Value' },
                        { id: 'proceeds_usdPennyValue', title: 'Proceeds USD Penny Value' }
                    ]
                });

                const records = [];
                listings.forEach(listing => {
                    records.push({
                        timestamp: listing.timestamp,
                        sellerAddress: listing.sellerAddress,
                        buyerAddress: listing.buyerAddress,
                        nftAddress: listing.nftAddress,
                        tokenId: listing.tokenId,
                        paymentMethodAddress: listing.paymentMethodAddress,
                        rawValue: listing.rawValue,
                        usdPennyValue: listing.usdPennyValue
                    });
                });
                proceeds.forEach(proceed => {
                    records.push({
                        timestamp: proceed.timestamp,
                        proceeds_sellerAddress: proceed.sellerAddress,
                        proceeds_rawValue: proceed.rawValue,
                        proceeds_usdPennyValue: proceed.usdPennyValue
                    });
                });

                await csvWriter.writeRecords(records);

                scheduleFileDeletion(filePath);
                res.status(200).download(filePath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                    } else {
                        console.log('File sent successfully');
                    }
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to export marketplace data', details: error.message });
            }
        });
}

module.exports = { addRoutes };
