import Arweave from 'arweave';
import { LevelDbCache } from '../cache/impl/LevelDbCache';
import { Contract } from '../contract/Contract';
import { CreateContract } from '../contract/deploy/CreateContract';
import { PstContract } from '../contract/PstContract';
import { GQLNodeInterface } from '../legacy/gqlResult';
import { MigrationTool } from '../contract/migration/MigrationTool';
import { Testing } from '../contract/testing/Testing';
import { DefinitionLoader } from './modules/DefinitionLoader';
import { ExecutorFactory } from './modules/ExecutorFactory';
import { HandlerApi } from './modules/impl/HandlerExecutorFactory';
import { InteractionsLoader } from './modules/InteractionsLoader';
import { EvalStateResult, StateEvaluator } from './modules/StateEvaluator';
import { WarpBuilder } from './WarpBuilder';
export declare type WarpEnvironment = 'local' | 'testnet' | 'mainnet' | 'custom';
/**
 * The Warp "motherboard" ;-).
 * This is the base class that supplies the implementation of the SmartWeave protocol
 * Allows to plug-in different implementation of all the modules defined in the constructor.
 *
 * After being fully configured, it allows to "connect" to
 * contract and perform operations on them (see {@link Contract})
 */
export declare class Warp {
    readonly arweave: Arweave;
    readonly levelDb: LevelDbCache<EvalStateResult<unknown>>;
    readonly definitionLoader: DefinitionLoader;
    readonly interactionsLoader: InteractionsLoader;
    readonly executorFactory: ExecutorFactory<HandlerApi<unknown>>;
    readonly stateEvaluator: StateEvaluator;
    readonly environment: WarpEnvironment;
    readonly createContract: CreateContract;
    readonly migrationTool: MigrationTool;
    readonly testing: Testing;
    constructor(arweave: Arweave, levelDb: LevelDbCache<EvalStateResult<unknown>>, definitionLoader: DefinitionLoader, interactionsLoader: InteractionsLoader, executorFactory: ExecutorFactory<HandlerApi<unknown>>, stateEvaluator: StateEvaluator, environment?: WarpEnvironment);
    static builder(arweave: Arweave, cache: LevelDbCache<EvalStateResult<unknown>>, environment: WarpEnvironment): WarpBuilder;
    /**
     * Allows to connect to any contract using its transaction id.
     * @param contractTxId
     * @param callingContract
     */
    contract<State>(contractTxId: string, callingContract?: Contract, callingInteraction?: GQLNodeInterface): Contract<State>;
    /**
     * Allows to connect to a contract that conforms to the Profit Sharing Token standard
     * @param contractTxId
     */
    pst(contractTxId: string): PstContract;
}
//# sourceMappingURL=Warp.d.ts.map