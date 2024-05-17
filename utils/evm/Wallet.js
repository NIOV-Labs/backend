const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

class Wallet {
  constructor() {
    const wPath = path.resolve(__dirname, 'WalletConfig.json');
    let wallet;

    if (fs.existsSync(wPath)) {
      const walletConfig = JSON.parse(fs.readFileSync(wPath, 'utf-8'));
      this.key = walletConfig.privateKey;
      wallet = new ethers.Wallet(this.key);
      this.address = wallet.address;
    } else {
      wallet = ethers.Wallet.createRandom();
      this.key = wallet.privateKey;
      this.address = wallet.address;
      const walletConfig = { privateKey: this.key };
      fs.writeFileSync(wPath, JSON.stringify(walletConfig, null, 2));
    }
  }
}

module.exports = Wallet;
