"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warp = void 0;
const DefaultCreateContract_1 = require("../contract/deploy/impl/DefaultCreateContract");
const HandlerBasedContract_1 = require("../contract/HandlerBasedContract");
const PstContractImpl_1 = require("../contract/PstContractImpl");
const MigrationTool_1 = require("../contract/migration/MigrationTool");
const Testing_1 = require("../contract/testing/Testing");
const WarpBuilder_1 = require("./WarpBuilder");
/**
 * The Warp "motherboard" ;-).
 * This is the base class that supplies the implementation of the SmartWeave protocol
 * Allows to plug-in different implementation of all the modules defined in the constructor.
 *
 * After being fully configured, it allows to "connect" to
 * contract and perform operations on them (see {@link Contract})
 */
class Warp {
    constructor(arweave, levelDb, definitionLoader, interactionsLoader, executorFactory, stateEvaluator, environment = 'custom') {
        this.arweave = arweave;
        this.levelDb = levelDb;
        this.definitionLoader = definitionLoader;
        this.interactionsLoader = interactionsLoader;
        this.executorFactory = executorFactory;
        this.stateEvaluator = stateEvaluator;
        this.environment = environment;
        this.createContract = new DefaultCreateContract_1.DefaultCreateContract(arweave, this);
        this.migrationTool = new MigrationTool_1.MigrationTool(arweave, levelDb);
        this.testing = new Testing_1.Testing(arweave);
    }
    static builder(arweave, cache, environment) {
        return new WarpBuilder_1.WarpBuilder(arweave, cache, environment);
    }
    /**
     * Allows to connect to any contract using its transaction id.
     * @param contractTxId
     * @param callingContract
     */
    contract(contractTxId, callingContract, callingInteraction) {
        return new HandlerBasedContract_1.HandlerBasedContract(contractTxId, this, callingContract, callingInteraction);
    }
    /**
     * Allows to connect to a contract that conforms to the Profit Sharing Token standard
     * @param contractTxId
     */
    pst(contractTxId) {
        return new PstContractImpl_1.PstContractImpl(contractTxId, this);
    }
}
exports.Warp = Warp;
//# sourceMappingURL=Warp.js.map