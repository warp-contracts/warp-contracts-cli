import Arweave from 'arweave';
import { GQLEdgeInterface, GQLNodeInterface } from '../../../legacy/gqlResult';
import { GW_TYPE, InteractionsLoader } from '../InteractionsLoader';
import { EvaluationOptions } from '../StateEvaluator';
interface TagFilter {
    name: string;
    values: string[];
}
interface BlockFilter {
    min?: number;
    max?: number;
}
export interface GqlReqVariables {
    tags: TagFilter[];
    blockFilter: BlockFilter;
    first: number;
    after?: string;
}
export declare function bundledTxsFilter(tx: GQLEdgeInterface): boolean;
export declare class ArweaveGatewayInteractionsLoader implements InteractionsLoader {
    protected readonly arweave: Arweave;
    private readonly logger;
    private static readonly query;
    private static readonly _30seconds;
    private readonly arweaveWrapper;
    private readonly sorter;
    constructor(arweave: Arweave);
    load(contractId: string, fromSortKey?: string, toSortKey?: string, evaluationOptions?: EvaluationOptions): Promise<GQLNodeInterface[]>;
    private loadPages;
    private getNextPage;
    type(): GW_TYPE;
    clearCache(): void;
}
export {};
//# sourceMappingURL=ArweaveGatewayInteractionsLoader.d.ts.map