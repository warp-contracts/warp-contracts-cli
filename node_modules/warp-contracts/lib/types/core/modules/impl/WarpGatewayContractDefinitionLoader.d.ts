import Arweave from 'arweave';
import 'redstone-isomorphic';
import { GW_TYPE } from '../InteractionsLoader';
import { ContractDefinition, ContractSource } from '../../../core/ContractDefinition';
import { DefinitionLoader } from '../DefinitionLoader';
import { WarpCache } from '../../../cache/WarpCache';
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export declare class WarpGatewayContractDefinitionLoader implements DefinitionLoader {
    private readonly baseUrl;
    private readonly cache?;
    private readonly rLogger;
    private contractDefinitionLoader;
    private arweaveWrapper;
    constructor(baseUrl: string, arweave: Arweave, cache?: WarpCache<string, ContractDefinition<unknown>>);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    type(): GW_TYPE;
}
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.d.ts.map