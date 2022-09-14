import Arweave from 'arweave';
import { WarpCache } from '../../../cache/WarpCache';
import { ContractDefinition, ContractSource } from '../../../core/ContractDefinition';
import { ArweaveWrapper } from '../../../utils/ArweaveWrapper';
import { DefinitionLoader } from '../DefinitionLoader';
import { GW_TYPE } from '../InteractionsLoader';
export declare class ContractDefinitionLoader implements DefinitionLoader {
    private readonly arweave;
    protected readonly cache?: WarpCache<string, ContractDefinition<unknown>>;
    private readonly logger;
    protected arweaveWrapper: ArweaveWrapper;
    constructor(arweave: Arweave, cache?: WarpCache<string, ContractDefinition<unknown>>);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    private evalInitialState;
    type(): GW_TYPE;
}
//# sourceMappingURL=ContractDefinitionLoader.d.ts.map