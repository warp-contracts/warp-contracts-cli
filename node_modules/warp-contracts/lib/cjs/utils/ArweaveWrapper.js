"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArweaveWrapper = void 0;
const arweave_1 = __importDefault(require("arweave"));
const transaction_1 = __importDefault(require("arweave/node/lib/transaction"));
const redstone_isomorphic_1 = require("redstone-isomorphic");
const WarpFactory_1 = require("../core/WarpFactory");
const LoggerFactory_1 = require("../logging/LoggerFactory");
class ArweaveWrapper {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('ArweaveWrapper');
        this.baseUrl = `${arweave.api.config.protocol}://${arweave.api.config.host}:${arweave.api.config.port}`;
        this.logger.debug('baseurl', this.baseUrl);
    }
    async warpGwInfo() {
        return await this.doFetchInfo(`${WarpFactory_1.WARP_GW_URL}/gateway/arweave/info`);
    }
    async warpGwBlock() {
        this.logger.debug('Calling warp gw block info');
        return await this.doFetchInfo(`${WarpFactory_1.WARP_GW_URL}/gateway/arweave/block`);
    }
    async info() {
        return await this.doFetchInfo(`${this.baseUrl}/info`);
    }
    async gql(query, variables) {
        try {
            const data = JSON.stringify({
                query: query,
                variables: variables
            });
            const response = await fetch(`${this.baseUrl}/graphql`, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a, _b;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.logger.error(error.body.message);
                }
                throw new Error(`Unable to retrieve gql page. ${error.status}: ${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
            });
            return {
                data: response,
                status: 200
            };
        }
        catch (e) {
            this.logger.error('Error while loading gql', e);
            throw e;
        }
    }
    async tx(id) {
        const response = await fetch(`${this.baseUrl}/tx/${id}`)
            .then((res) => {
            return res.ok ? res.json() : Promise.reject(res);
        })
            .catch((error) => {
            var _a, _b;
            if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                this.logger.error(error.body.message);
            }
            throw new Error(`Unable to retrieve tx ${id}. ${error.status}. ${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
        });
        return new transaction_1.default({
            ...response
        });
    }
    async txData(id) {
        // note: this is using arweave.net cache -
        // not very safe and clever, but fast...
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) {
            this.logger.warn(`Unable to load data from arweave.net/${id} endpoint, falling back to arweave.js`);
            // fallback to arweave-js as a last resort..
            const txData = (await this.arweave.transactions.getData(id, {
                decode: true
            }));
            return redstone_isomorphic_1.Buffer.from(txData);
        }
        else {
            const buffer = await response.arrayBuffer();
            return redstone_isomorphic_1.Buffer.from(buffer);
        }
    }
    async txDataString(id) {
        const buffer = await this.txData(id);
        return arweave_1.default.utils.bufferToString(buffer);
    }
    async doFetchInfo(url) {
        try {
            const response = await fetch(url)
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a, _b;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.logger.error(error.body.message);
                }
                throw new Error(`Unable to retrieve info. ${error.status}: ${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
            });
            return response;
        }
        catch (e) {
            this.logger.error('Error while loading info', e);
            throw e;
        }
    }
}
exports.ArweaveWrapper = ArweaveWrapper;
//# sourceMappingURL=ArweaveWrapper.js.map