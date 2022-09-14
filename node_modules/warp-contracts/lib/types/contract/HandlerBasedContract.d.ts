import { SortKeyCacheResult } from '../cache/SortKeyCache';
import { ContractCallStack } from '../core/ContractCallStack';
import { InteractionResult } from '../core/modules/impl/HandlerExecutorFactory';
import { EvaluationOptions, EvalStateResult } from '../core/modules/StateEvaluator';
import { Warp } from '../core/Warp';
import { GQLNodeInterface } from '../legacy/gqlResult';
import { Contract, BenchmarkStats, SigningFunction, CurrentTx, WriteInteractionOptions, WriteInteractionResponse } from './Contract';
import { Tags, ArTransfer, ArWallet } from './deploy/CreateContract';
import { SourceData } from './deploy/impl/SourceImpl';
/**
 * An implementation of {@link Contract} that is backwards compatible with current style
 * of writing SW contracts (ie. using the "handle" function).
 *
 * It requires {@link ExecutorFactory} that is using {@link HandlerApi} generic type.
 */
export declare class HandlerBasedContract<State> implements Contract<State> {
    private readonly _contractTxId;
    protected readonly warp: Warp;
    private readonly _parentContract;
    private readonly _callingInteraction;
    private readonly logger;
    private _callStack;
    private _evaluationOptions;
    private readonly _innerWritesEvaluator;
    private readonly _callDepth;
    private _benchmarkStats;
    private readonly _arweaveWrapper;
    private _sorter;
    private _rootSortKey;
    /**
     * wallet connected to this contract
     */
    protected signer?: SigningFunction;
    constructor(_contractTxId: string, warp: Warp, _parentContract?: Contract, _callingInteraction?: GQLNodeInterface);
    readState(sortKeyOrBlockHeight?: string | number, currentTx?: CurrentTx[], interactions?: GQLNodeInterface[]): Promise<SortKeyCacheResult<EvalStateResult<State>>>;
    viewState<Input, View>(input: Input, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, View>>;
    viewStateForTx<Input, View>(input: Input, interactionTx: GQLNodeInterface): Promise<InteractionResult<State, View>>;
    dryWrite<Input>(input: Input, caller?: string, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, unknown>>;
    dryWriteFromTx<Input>(input: Input, transaction: GQLNodeInterface, currentTx?: CurrentTx[]): Promise<InteractionResult<State, unknown>>;
    writeInteraction<Input>(input: Input, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;
    private bundleInteraction;
    private createInteraction;
    txId(): string;
    getCallStack(): ContractCallStack;
    connect(signer: ArWallet | SigningFunction): Contract<State>;
    setEvaluationOptions(options: Partial<EvaluationOptions>): Contract<State>;
    private waitForConfirmation;
    private createExecutionContext;
    private getToSortKey;
    private createExecutionContextFromTx;
    private maybeResetRootContract;
    private callContract;
    private callContractForTx;
    private evalInteraction;
    parent(): Contract | null;
    callDepth(): number;
    evaluationOptions(): EvaluationOptions;
    lastReadStateStats(): BenchmarkStats;
    stateHash(state: State): string;
    syncState(externalUrl: string, params?: any): Promise<Contract>;
    evolve(newSrcTxId: string, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;
    save(sourceData: SourceData): Promise<any>;
    get callingInteraction(): GQLNodeInterface | null;
    get rootSortKey(): string;
}
//# sourceMappingURL=HandlerBasedContract.d.ts.map