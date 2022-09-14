import { WarpCache } from '../../cache/WarpCache';
/**
 * A simple, in-memory cache, with keys being transaction ids (e.g. contract transaction id).
 */
export declare class MemCache<V = any> implements WarpCache<string, V> {
    private readonly storage;
    clearAll(): void;
    contains(key: string): boolean;
    get(key: string): V;
    put(key: string, value: V): void;
    remove(key: string): void;
}
//# sourceMappingURL=MemCache.d.ts.map