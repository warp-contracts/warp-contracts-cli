import Arweave from 'arweave';
import { WarpCache } from '../cache/WarpCache';
import { ContractDefinition } from '../core/ContractDefinition';
import { ExecutorFactory } from '../core/modules/ExecutorFactory';
import { EvaluationOptions } from '../core/modules/StateEvaluator';
/**
 * An implementation of ExecutorFactory that adds caching capabilities
 */
export declare class CacheableExecutorFactory<Api> implements ExecutorFactory<Api> {
    private readonly arweave;
    private readonly baseImplementation;
    private readonly cache;
    private readonly logger;
    constructor(arweave: Arweave, baseImplementation: ExecutorFactory<Api>, cache: WarpCache<string, Api>);
    create<State>(contractDefinition: ContractDefinition<State>, evaluationOptions: EvaluationOptions): Promise<Api>;
}
//# sourceMappingURL=CacheableExecutorFactory.d.ts.map