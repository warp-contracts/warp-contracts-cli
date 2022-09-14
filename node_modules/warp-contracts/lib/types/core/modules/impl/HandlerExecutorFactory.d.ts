import Arweave from 'arweave';
import { ContractDefinition } from '../../../core/ContractDefinition';
import { ExecutionContext } from '../../../core/ExecutionContext';
import { GQLNodeInterface } from '../../../legacy/gqlResult';
import { ExecutorFactory } from '../ExecutorFactory';
import { EvaluationOptions, EvalStateResult } from '../StateEvaluator';
/**
 * A factory that produces handlers that are compatible with the "current" style of
 * writing SW contracts (i.e. using "handle" function).
 */
export declare class HandlerExecutorFactory implements ExecutorFactory<HandlerApi<unknown>> {
    private readonly arweave;
    private readonly logger;
    private readonly cache;
    constructor(arweave: Arweave);
    create<State>(contractDefinition: ContractDefinition<State>, evaluationOptions: EvaluationOptions): Promise<HandlerApi<State>>;
}
export interface InteractionData<Input> {
    interaction?: ContractInteraction<Input>;
    interactionTx: GQLNodeInterface;
    currentTx: {
        interactionTxId: string;
        contractTxId: string;
    }[];
}
/**
 * A handle that effectively runs contract's code.
 */
export interface HandlerApi<State> {
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    initState(state: State): void;
}
export declare type HandlerFunction<State, Input, Result> = (state: State, interaction: ContractInteraction<Input>) => Promise<HandlerResult<State, Result>>;
export declare type HandlerResult<State, Result> = {
    result: Result;
    state: State;
    gasUsed?: number;
};
export declare type InteractionResult<State, Result> = HandlerResult<State, Result> & {
    type: InteractionResultType;
    errorMessage?: string;
    originalValidity?: Record<string, boolean>;
    originalErrorMessages?: Record<string, string>;
};
export declare type ContractInteraction<Input> = {
    input: Input;
    caller: string;
};
export declare type InteractionResultType = 'ok' | 'error' | 'exception';
//# sourceMappingURL=HandlerExecutorFactory.d.ts.map