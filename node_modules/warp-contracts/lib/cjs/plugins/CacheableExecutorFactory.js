"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableExecutorFactory = void 0;
const LoggerFactory_1 = require("../logging/LoggerFactory");
/**
 * An implementation of ExecutorFactory that adds caching capabilities
 */
class CacheableExecutorFactory {
    constructor(arweave, baseImplementation, cache) {
        this.arweave = arweave;
        this.baseImplementation = baseImplementation;
        this.cache = cache;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('CacheableExecutorFactory');
    }
    async create(contractDefinition, evaluationOptions) {
        return await this.baseImplementation.create(contractDefinition, evaluationOptions);
        // warn: do not cache on the contractDefinition.srcTxId. This might look like a good optimisation
        // (as many contracts share the same source code), but unfortunately this is causing issues
        // with the same SwGlobal object being cached for all contracts with the same source code
        // (eg. SwGlobal.contract.id field - which of course should have different value for different contracts
        // that share the same source).
        // warn#2: cache key MUST be a combination of both txId and srcTxId -
        // as "evolve" feature changes the srcTxId for the given txId...
        // switching off caching for now
        // - https://github.com/redstone-finance/redstone-smartcontracts/issues/53
        // probably should be cached on a lower level - i.e. either handler function (for js contracts)
        // or wasm module.
    }
}
exports.CacheableExecutorFactory = CacheableExecutorFactory;
//# sourceMappingURL=CacheableExecutorFactory.js.map