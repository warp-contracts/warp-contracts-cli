"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortKeyCacheResult = exports.CacheKey = void 0;
class CacheKey {
    constructor(contractTxId, sortKey) {
        this.contractTxId = contractTxId;
        this.sortKey = sortKey;
    }
}
exports.CacheKey = CacheKey;
// tslint:disable-next-line:max-classes-per-file
class SortKeyCacheResult {
    constructor(sortKey, cachedValue) {
        this.sortKey = sortKey;
        this.cachedValue = cachedValue;
    }
}
exports.SortKeyCacheResult = SortKeyCacheResult;
//# sourceMappingURL=SortKeyCache.js.map