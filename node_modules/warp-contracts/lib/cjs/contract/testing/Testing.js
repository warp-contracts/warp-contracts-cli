"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testing = void 0;
class Testing {
    constructor(arweave) {
        this.arweave = arweave;
    }
    async mineBlock() {
        this.validateEnv();
        await this.arweave.api.get('mine');
    }
    async generateWallet() {
        this.validateEnv();
        const wallet = await this.arweave.wallets.generate();
        await this.addFunds(wallet);
        return {
            jwk: wallet,
            address: await this.arweave.wallets.jwkToAddress(wallet)
        };
    }
    async addFunds(wallet) {
        const walletAddress = await this.arweave.wallets.getAddress(wallet);
        await this.arweave.api.get(`/mint/${walletAddress}/1000000000000000`);
    }
    validateEnv() {
        if (this.arweave.api.getConfig().host.includes('arweave')) {
            throw new Error('Testing features are not available in a non testing environment');
        }
    }
}
exports.Testing = Testing;
//# sourceMappingURL=Testing.js.map