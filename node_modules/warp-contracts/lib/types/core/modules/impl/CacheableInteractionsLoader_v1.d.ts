import { GQLNodeInterface } from '../../../legacy/gqlResult';
import { InteractionsLoader, GW_TYPE } from '../InteractionsLoader';
import { EvaluationOptions } from '../StateEvaluator';
export declare class CacheableInteractionsLoader_v1 implements InteractionsLoader {
    private readonly delegate;
    private readonly logger;
    private readonly interactionsCache;
    constructor(delegate: InteractionsLoader, cacheOptions?: import("../../../core/WarpFactory").CacheOptions);
    load(contractTxId: string, fromSortKey?: string, toSortKey?: string, evaluationOptions?: EvaluationOptions): Promise<GQLNodeInterface[]>;
    private doCache;
    type(): GW_TYPE;
    clearCache(): void;
}
//# sourceMappingURL=CacheableInteractionsLoader_v1.d.ts.map