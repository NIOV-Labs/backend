require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const ethers = require('ethers');

const BASE_URL = 'http://localhost:3000/api';

const logResponse = (response) => {
  console.log(`Status: ${response.status}`);
  console.log('Data:', response.data);
};

const generateSignature = async () => {
  const walletConfigPath = './utils/evm/WalletConfig.json';
  if (!fs.existsSync(walletConfigPath)) {
    throw new Error('WalletConfig.json not found');
  }

  const walletConfig = JSON.parse(fs.readFileSync(walletConfigPath, 'utf-8'));
  const privateKey = walletConfig.privateKey;

  const wallet = new ethers.Wallet(privateKey);
  const message = 'Login';
  const signature = await wallet.signMessage(message);

  return { message, signature, address: wallet.address };
};

const testLogin = async () => {
  console.log("Testing Login...");
  try {
    const { message, signature, address } = await generateSignature(); 
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      user: {
        message,
        signature,
        address,
      },
    });
    console.log(`Status: ${loginResponse.status}`);
    const tokens = loginResponse.data;
    return tokens;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
  }
};

const testBalance = async (accessToken, alias) => {
  console.log("Testing Get Balance...");
  try {
    const balanceResponse = await axios.get(`${BASE_URL}/balance/${alias}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    logResponse(balanceResponse);
  } catch (error) {
    console.error('Balance Error:', error.response ? error.response.data : error.message);
  }
};

const runTests = async () => {
  const tokens = await testLogin();
  console.log(tokens)
  if (tokens && tokens.atkn) {
    const alias = 'sepolia'; 
    await testBalance(tokens.atkn, alias);
  }
};

runTests();