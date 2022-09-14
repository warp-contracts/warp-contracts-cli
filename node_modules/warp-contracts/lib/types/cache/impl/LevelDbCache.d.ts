import { SortKeyCache, CacheKey, SortKeyCacheResult } from '../SortKeyCache';
import { CacheOptions } from '../../core/WarpFactory';
/**
 * The LevelDB is a lexicographically sorted key-value database - so it's ideal for this use case
 * - as it simplifies cache look-ups (e.g. lastly stored value or value "lower-or-equal" than given sortKey).
 * The cache for contracts are implemented as sub-levels - https://www.npmjs.com/package/level#sublevel--dbsublevelname-options.
 *
 * The default location for the node.js cache is ./cache/warp.
 * The default name for the browser IndexedDB cache is warp-cache
 *
 * In order to reduce the cache size, the oldest entries are automatically pruned.
 */
export declare class LevelDbCache<V = any> implements SortKeyCache<V> {
    private readonly logger;
    /**
     * not using the Level type, as it is not compatible with MemoryLevel (i.e. has more properties)
     * and there doesn't seem to be any public interface/abstract type for all Level implementations
     * (the AbstractLevel is not exported from the package...)
     */
    private db;
    constructor(cacheOptions: CacheOptions);
    get(contractTxId: string, sortKey: string, returnDeepCopy?: boolean): Promise<SortKeyCacheResult<V> | null>;
    getLast(contractTxId: string): Promise<SortKeyCacheResult<V> | null>;
    getLessOrEqual(contractTxId: string, sortKey: string): Promise<SortKeyCacheResult<V> | null>;
    put(stateCacheKey: CacheKey, value: V): Promise<void>;
    close(): Promise<void>;
    dump(): Promise<any>;
    getLastSortKey(): Promise<string | null>;
    allContracts(): Promise<string[]>;
}
//# sourceMappingURL=LevelDbCache.d.ts.map