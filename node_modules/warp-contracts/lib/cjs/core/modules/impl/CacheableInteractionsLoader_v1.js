"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableInteractionsLoader_v1 = void 0;
const LevelDbCache_1 = require("../../../cache/impl/LevelDbCache");
const SortKeyCache_1 = require("../../../cache/SortKeyCache");
const WarpFactory_1 = require("../../../core/WarpFactory");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
class CacheableInteractionsLoader_v1 {
    constructor(delegate, cacheOptions = WarpFactory_1.defaultCacheOptions) {
        this.delegate = delegate;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('CacheableInteractionsLoader');
        this.interactionsCache = new LevelDbCache_1.LevelDbCache(cacheOptions);
    }
    async load(contractTxId, fromSortKey, toSortKey, evaluationOptions) {
        this.logger.debug(`Loading interactions for`, {
            contractTxId,
            fromSortKey,
            toSortKey
        });
        let originalCachedInteractions;
        let effectiveCachedInteractions;
        if (toSortKey) {
            originalCachedInteractions = (await this.interactionsCache.getLessOrEqual(contractTxId, toSortKey)).cachedValue;
        }
        else {
            originalCachedInteractions = (await this.interactionsCache.getLast(contractTxId)).cachedValue;
        }
        // if anything was cached
        if (originalCachedInteractions === null || originalCachedInteractions === void 0 ? void 0 : originalCachedInteractions.length) {
            // cache MUST always contain all values from the first interaction 'till cached sortKey
            // if fromSortKey is specified, we need to first filter the cached interactions
            if (fromSortKey) {
                effectiveCachedInteractions = originalCachedInteractions.filter((i) => i.sortKey.localeCompare(fromSortKey) >= 0);
            }
            else {
                effectiveCachedInteractions = originalCachedInteractions;
            }
            const lastCachedKey = effectiveCachedInteractions[effectiveCachedInteractions.length - 1].sortKey;
            if (toSortKey && toSortKey.localeCompare(lastCachedKey) == 0) {
                // if 'toSortKey' was specified and exactly the same as lastCachedKey - return immediately
                this.logger.debug(`Interaction fully cached`, {
                    contractTxId,
                    fromSortKey,
                    toSortKey
                });
                // TODO: add sanity check
                return effectiveCachedInteractions;
            }
            else {
                // if either toSortKey was not specified or toSortKey is different from lastCachedKey
                // - we need to download the (potentially) missing interactions - from the lastCacheKey
                const missingInteractions = await this.delegate.load(contractTxId, lastCachedKey, toSortKey, evaluationOptions);
                // at each given sortKey we need to cache all the interactions, not those filtered from 'fromSortKey'
                const toCache = originalCachedInteractions.concat(missingInteractions);
                await this.doCache(contractTxId, toCache);
                return effectiveCachedInteractions.concat(missingInteractions);
            }
        }
        else {
            // no values found in cache - load data from gateway
            // sanity check - if no value was cached, then this means we're making an initial state evaluation
            // - so the fromSortKey should not be set
            if (fromSortKey) {
                throw new Error('fromSortKey should not be specified when no interactions found in cache');
            }
            const missingInteractions = await this.delegate.load(contractTxId, fromSortKey, toSortKey, evaluationOptions);
            await this.doCache(contractTxId, missingInteractions);
            return missingInteractions;
        }
    }
    async doCache(contractTxId, interactions) {
        // we can only cache fully confirmed interactions (for Warp gateway)
        // in case of Arweave gateway (when no confirmationStatus is set) - all interactions are always cached
        const interactionsToCache = interactions.filter((i) => i.confirmationStatus == undefined || i.confirmationStatus == 'confirmed');
        const cacheSortKey = interactionsToCache[interactionsToCache.length - 1].sortKey;
        await this.interactionsCache.put(new SortKeyCache_1.CacheKey(contractTxId, cacheSortKey), interactionsToCache);
    }
    type() {
        return this.delegate.type();
    }
    clearCache() {
        // noop
    }
}
exports.CacheableInteractionsLoader_v1 = CacheableInteractionsLoader_v1;
//# sourceMappingURL=CacheableInteractionsLoader_v1.js.map