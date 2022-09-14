import { InteractionData } from './modules/impl/HandlerExecutorFactory';
export declare class ContractCallStack {
    readonly contractTxId: string;
    readonly depth: number;
    readonly label: string;
    readonly interactions: Map<string, InteractionCall>;
    constructor(contractTxId: string, depth: number, label?: string);
    addInteractionData(interactionData: InteractionData<any>): InteractionCall;
    getInteraction(txId: string): InteractionCall;
    print(): string;
}
export declare class InteractionCall {
    readonly interactionInput: InteractionInput;
    interactionOutput: InteractionOutput;
    private constructor();
    static create(interactionInput: InteractionInput): InteractionCall;
    update(interactionOutput: InteractionOutput): void;
}
export declare class InteractionInput {
    readonly txId: string;
    readonly sortKey: string;
    readonly blockHeight: number;
    readonly blockTimestamp: number;
    readonly caller: string;
    readonly functionName: string;
    readonly functionArguments: [];
    readonly dryWrite: boolean;
    readonly foreignContractCalls: Map<string, ContractCallStack>;
    constructor(txId: string, sortKey: string, blockHeight: number, blockTimestamp: number, caller: string, functionName: string, functionArguments: [], dryWrite: boolean, foreignContractCalls?: Map<string, ContractCallStack>);
}
export declare class InteractionOutput {
    readonly cacheHit: boolean;
    readonly outputState: any;
    readonly executionTime: number;
    readonly valid: boolean;
    readonly errorMessage: string;
    readonly gasUsed: number;
    constructor(cacheHit: boolean, outputState: any, executionTime: number, valid: boolean, errorMessage: string, gasUsed: number);
}
//# sourceMappingURL=ContractCallStack.d.ts.map