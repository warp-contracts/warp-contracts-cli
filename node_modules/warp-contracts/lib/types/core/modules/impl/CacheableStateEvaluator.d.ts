import Arweave from 'arweave';
import { SortKeyCache, SortKeyCacheResult } from '../../../cache/SortKeyCache';
import { CurrentTx } from '../../../contract/Contract';
import { ExecutionContext } from '../../../core/ExecutionContext';
import { ExecutionContextModifier } from '../../../core/ExecutionContextModifier';
import { GQLNodeInterface } from '../../../legacy/gqlResult';
import { EvalStateResult } from '../StateEvaluator';
import { DefaultStateEvaluator } from './DefaultStateEvaluator';
import { HandlerApi } from './HandlerExecutorFactory';
/**
 * An implementation of DefaultStateEvaluator that adds caching capabilities.
 *
 * The main responsibility of this class is to compute whether there are
 * any interaction transactions, for which the state hasn't been evaluated yet -
 * if so - it generates a list of such transactions and evaluates the state
 * for them - taking as an input state the last cached state.
 */
export declare class CacheableStateEvaluator extends DefaultStateEvaluator {
    private readonly cache;
    private readonly cLogger;
    constructor(arweave: Arweave, cache: SortKeyCache<EvalStateResult<unknown>>, executionContextModifiers?: ExecutionContextModifier[]);
    eval<State>(executionContext: ExecutionContext<State, HandlerApi<State>>, currentTx: CurrentTx[]): Promise<SortKeyCacheResult<EvalStateResult<State>>>;
    onStateEvaluated<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    onStateUpdate<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>, force?: boolean): Promise<void>;
    latestAvailableState<State>(contractTxId: string, sortKey?: string): Promise<SortKeyCacheResult<EvalStateResult<State>> | null>;
    onInternalWriteStateUpdate<State>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State>): Promise<void>;
    onContractCall<State>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State>): Promise<void>;
    putInCache<State>(contractTxId: string, transaction: GQLNodeInterface, state: EvalStateResult<State>): Promise<void>;
    syncState(contractTxId: string, sortKey: string, state: any, validity: any): Promise<void>;
    dumpCache(): Promise<any>;
    internalWriteState<State>(contractTxId: string, sortKey: string): Promise<SortKeyCacheResult<EvalStateResult<State>> | null>;
    hasContractCached(contractTxId: string): Promise<boolean>;
    lastCachedSortKey(): Promise<string | null>;
    allCachedContracts(): Promise<string[]>;
}
//# sourceMappingURL=CacheableStateEvaluator.d.ts.map