const { ethers } = require('ethers');
const fs = require('fs');

class Network {
	constructor(wallet) {
		this.wallet = wallet;
		this.data = require('./ChainConfig.json');
		this.list = Object.keys(this.data);
		console.log('Network initialized with the following configurations:');
		console.log(this.list);
	}

	info(alias) {
		console.log(`Getting info for alias: ${alias}`);
		const available = this.list;
		const data = this.data;
		if (available.includes(alias)) {
			console.log(`Found alias in available list: ${alias}`);
			return data[alias];
		}

		for (const item of available) {
			const { id, name, network } = data[item];
			if ([id, name, network].includes(alias)) {
				console.log(`Found alias in data item: ${item}`);
				return data[item];
			}
		}

		throw new Error(`Evm.Network.info - could not find ${alias}`);
	}

	explorer(alias) {
		let info;
		try {
			info = this.info(alias);
			if (!info.explorer) throw new Error('!explorer');
			const url = info.explorer.url;
			if (!url) throw new Error('!explorer.url');
			return url;
		} catch (err) {
			throw new Error(
				`Evm.Network.explorer ${
					info ? `- ${err.toString()}\n` : `\n${err.toString()}`
				}`
			);
		}
	}

	provider(alias) {
		let info;
		try {
			info = this.info(alias);
			const rpc = info.rpc;
			if (!rpc) throw new Error('!rpc');
			console.log(`Creating provider for alias: ${alias} with RPC: ${rpc}`);
			return new ethers.JsonRpcProvider(rpc);
		} catch (err) {
			throw new Error(
				`Evm.Network.provider ${
					info ? `- ${err.toString()}\n` : `\n${err.toString()}`
				}`
			);
		}
	}

	signer(alias) {
		try {
			console.log(`Creating signer for alias: ${alias}`);
			return new ethers.Wallet(this.wallet.key, this.provider(alias));
		} catch (err) {
			throw new Error(`Evm.Network.signer\n${err.toString()}`);
		}
	}

	websocket(alias) {
		try {
			info = this.info(alias);
			const wss = info.wss;
			if (!wss) throw new Error('!wss');
			console.log(`Creating websocket for alias: ${alias} with socket: ${wss}`);
			return new ethers.WebSocketProvider(wss);
		} catch (err) {
			throw new Error(
				`Evm.Network.websocket ${
					info ? `- ${err.toString()}\n` : `\n${err.toString()}`
				}`
			);
		}
	}

	async balance(alias) {
		try {
			console.log(`Getting balance for alias: ${alias}`);
			const provider = this.provider(alias);
			const address = this.wallet.address;
			console.log(`Using address: ${address}`);
			const result = await provider.getBalance(address);
			console.log(`Balance result: ${result.toString()}`);
			return ethers.formatEther(result);
		} catch (err) {
			throw new Error(`Evm.Network.balance\n${err.toString()}`);
		}
	}
}

module.exports = Network;
