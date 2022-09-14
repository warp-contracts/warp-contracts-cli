import { CurrentTx } from '../../../../contract/Contract';
import { ContractDefinition } from '../../../../core/ContractDefinition';
import { ExecutionContext } from '../../../../core/ExecutionContext';
import { EvalStateResult } from '../../../../core/modules/StateEvaluator';
import { GQLNodeInterface } from '../../../../legacy/gqlResult';
import { SmartWeaveGlobal } from '../../../../legacy/smartweave-global';
import { HandlerApi, InteractionData, InteractionResult } from '../HandlerExecutorFactory';
export declare abstract class AbstractContractHandler<State> implements HandlerApi<State> {
    protected readonly swGlobal: SmartWeaveGlobal;
    protected readonly contractDefinition: ContractDefinition<State>;
    protected logger: import("../../../..").WarpLogger;
    protected constructor(swGlobal: SmartWeaveGlobal, contractDefinition: ContractDefinition<State>);
    abstract handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    abstract initState(state: State): void;
    dispose(): Promise<void>;
    protected assignWrite(executionContext: ExecutionContext<State>, currentTx: CurrentTx[]): void;
    protected assignViewContractState<Input>(executionContext: ExecutionContext<State>): void;
    protected assignReadContractState<Input>(executionContext: ExecutionContext<State>, currentTx: CurrentTx[], currentResult: EvalStateResult<State>, interactionTx: GQLNodeInterface): void;
    protected assignRefreshState(executionContext: ExecutionContext<State>): void;
}
//# sourceMappingURL=AbstractContractHandler.d.ts.map