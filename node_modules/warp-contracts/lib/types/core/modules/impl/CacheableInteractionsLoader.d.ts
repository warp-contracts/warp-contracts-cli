import { GQLNodeInterface } from '../../../legacy/gqlResult';
import { InteractionsLoader, GW_TYPE } from '../InteractionsLoader';
import { EvaluationOptions } from '../StateEvaluator';
export declare class CacheableInteractionsLoader implements InteractionsLoader {
    private readonly delegate;
    private readonly logger;
    private readonly interactionsCache;
    constructor(delegate: InteractionsLoader);
    load(contractTxId: string, fromSortKey?: string, toSortKey?: string, evaluationOptions?: EvaluationOptions): Promise<GQLNodeInterface[]>;
    type(): GW_TYPE;
    clearCache(): void;
}
//# sourceMappingURL=CacheableInteractionsLoader.d.ts.map