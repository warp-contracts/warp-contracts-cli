"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeaveGlobal = void 0;
/**
 *
 * This class is exposed as a global for contracts
 * as 'SmartWeave' and provides an API for getting further
 * information or using utility and crypto functions from
 * inside the contracts execution.
 *
 * It provides an api:
 *
 * - SmartWeave.transaction.id
 * - SmartWeave.transaction.reward
 * - SmartWeave.block.height
 * - SmartWeave.block.timestamp
 * - etc
 *
 * and access to some of the arweave utils:
 * - SmartWeave.arweave.utils
 * - SmartWeave.arweave.crypto
 * - SmartWeave.arweave.wallets
 * - SmartWeave.arweave.ar
 *
 * as well as access to the potentially non-deterministic full client:
 * - SmartWeave.unsafeClient
 *
 */
class SmartWeaveGlobal {
    constructor(arweave, contract, evaluationOptions) {
        this.gasUsed = 0;
        this.gasLimit = Number.MAX_SAFE_INTEGER;
        this.unsafeClient = arweave;
        this.arweave = {
            ar: arweave.ar,
            utils: arweave.utils,
            wallets: arweave.wallets,
            crypto: arweave.crypto
        };
        this.evaluationOptions = evaluationOptions;
        this.contract = contract;
        this.transaction = new Transaction(this);
        this.block = new Block(this);
        this.contracts = {
            readContractState: (contractId, height, returnValidity) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            viewContractState: (contractId, input) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            write: (contractId, input, throwOnError) => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            },
            refreshState: () => {
                throw new Error('Not implemented - should be set by HandlerApi implementor');
            }
        };
        this.vrf = new Vrf(this);
        this.useGas = this.useGas.bind(this);
        this.getBalance = this.getBalance.bind(this);
    }
    useGas(gas) {
        if (gas < 0) {
            throw new Error(`[RE:GNE] Gas number exception - gas < 0.`);
        }
        this.gasUsed += gas;
        if (this.gasUsed > this.gasLimit) {
            throw new Error(`[RE:OOG] Out of gas! Used: ${this.gasUsed}, limit: ${this.gasLimit}`);
        }
    }
    async getBalance(address, height) {
        if (!this._activeTx) {
            throw new Error('Cannot read balance - active tx is not set.');
        }
        if (!this.block.height) {
            throw new Error('Cannot read balance - block height not set.');
        }
        const effectiveHeight = height || this.block.height;
        // http://nyc-1.dev.arweave.net:1984/block/height/914387/wallet/M-mpNeJbg9h7mZ-uHaNsa5jwFFRAq0PsTkNWXJ-ojwI/balance
        return await fetch(`${this.evaluationOptions.walletBalanceUrl}block/height/${effectiveHeight}/wallet/${address}/balance`)
            .then((res) => {
            return res.ok ? res.text() : Promise.reject(res);
        })
            .catch((error) => {
            var _a;
            throw new Error(`Unable to read wallet balance. ${error.status}. ${(_a = error.body) === null || _a === void 0 ? void 0 : _a.message}`);
        });
    }
}
exports.SmartWeaveGlobal = SmartWeaveGlobal;
// tslint:disable-next-line: max-classes-per-file
class Transaction {
    constructor(smartWeaveGlobal) {
        this.smartWeaveGlobal = smartWeaveGlobal;
    }
    get id() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.id;
    }
    get owner() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.owner.address;
    }
    get target() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.recipient;
    }
    get tags() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.tags;
    }
    get quantity() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.quantity.winston;
    }
    get reward() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.fee.winston;
    }
}
// tslint:disable-next-line: max-classes-per-file
class Block {
    constructor(smartWeaveGlobal) {
        this.smartWeaveGlobal = smartWeaveGlobal;
    }
    get height() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.block.height;
    }
    get indep_hash() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current Tx');
        }
        return this.smartWeaveGlobal._activeTx.block.id;
    }
    get timestamp() {
        if (!this.smartWeaveGlobal._activeTx) {
            throw new Error('No current tx');
        }
        return this.smartWeaveGlobal._activeTx.block.timestamp;
    }
}
class Vrf {
    constructor(smartWeaveGlobal) {
        this.smartWeaveGlobal = smartWeaveGlobal;
    }
    get data() {
        return this.smartWeaveGlobal._activeTx.vrf;
    }
    // returns the original generated random number as a BigInt string;
    get value() {
        return this.smartWeaveGlobal._activeTx.vrf.bigint;
    }
    // returns a random value in a range from 1 to maxValue
    randomInt(maxValue) {
        if (!Number.isInteger(maxValue)) {
            throw new Error('Integer max value required for random integer generation');
        }
        const result = (BigInt(this.smartWeaveGlobal._activeTx.vrf.bigint) % BigInt(maxValue)) + BigInt(1);
        if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) {
            throw new Error('Random int cannot be cast to number');
        }
        return Number(result);
    }
}
//# sourceMappingURL=smartweave-global.js.map