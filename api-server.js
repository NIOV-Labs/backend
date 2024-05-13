const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// Free MongoDB for testing
const mongoURI = 'mongodb+srv://j3robinson1:2Iyts8t22%40@abt-cluster.1bwefte.mongodb.net/?retryWrites=true&w=majority&appName=ABT-Cluster';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const TokenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    baseURI: { type: String, required: true },
    description: { type: String, required: true },
    contractRedemptionVoucher: {
      fileName: String,
      fileURL: String,
    },
    thumbnail: { type: String },
    externalURL: { type: String },
    assetURL: { type: String }
});
const Token = mongoose.model('Token', TokenSchema);

app.post('/api/token', async (req, res) => {
  const { name, symbol, baseURI, description, contractRedemptionVoucher, thumbnail, externalURL, assetURL } = req.body;
  try {
    const newToken = new Token({
      name,
      symbol,
      baseURI,
      description,
      contractRedemptionVoucher,
      thumbnail,
      externalURL,
      assetURL
    });
    await newToken.save();
    res.status(201).send(newToken);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/token/:tokenId', async (req, res) => {
    try {
      const token = await Token.findOne({ _id: req.params.tokenId });
      if (!token) {
        return res.status(404).send('Token not found');
      }
      res.send(token);
    } catch (error) {
      res.status(500).send(error);
    }
});  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Discord Webhook Test