"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionOutput = exports.InteractionInput = exports.InteractionCall = exports.ContractCallStack = void 0;
const utils_1 = require("../utils/utils");
class ContractCallStack {
    constructor(contractTxId, depth, label = '') {
        this.contractTxId = contractTxId;
        this.depth = depth;
        this.label = label;
        this.interactions = new Map();
    }
    addInteractionData(interactionData) {
        const { interaction, interactionTx } = interactionData;
        const interactionCall = InteractionCall.create(new InteractionInput(interactionTx.id, interactionTx.sortKey, interactionTx.block.height, interactionTx.block.timestamp, interaction === null || interaction === void 0 ? void 0 : interaction.caller, interaction === null || interaction === void 0 ? void 0 : interaction.input.function, interaction === null || interaction === void 0 ? void 0 : interaction.input, interactionTx.dry, new Map()));
        this.interactions.set(interactionTx.id, interactionCall);
        return interactionCall;
    }
    getInteraction(txId) {
        return this.interactions.get(txId);
    }
    print() {
        return JSON.stringify(this, utils_1.mapReplacer);
    }
}
exports.ContractCallStack = ContractCallStack;
class InteractionCall {
    constructor(interactionInput) {
        this.interactionInput = interactionInput;
    }
    static create(interactionInput) {
        return new InteractionCall(interactionInput);
    }
    update(interactionOutput) {
        this.interactionOutput = interactionOutput;
    }
}
exports.InteractionCall = InteractionCall;
class InteractionInput {
    constructor(txId, sortKey, blockHeight, blockTimestamp, caller, functionName, functionArguments, dryWrite, foreignContractCalls = new Map()) {
        this.txId = txId;
        this.sortKey = sortKey;
        this.blockHeight = blockHeight;
        this.blockTimestamp = blockTimestamp;
        this.caller = caller;
        this.functionName = functionName;
        this.functionArguments = functionArguments;
        this.dryWrite = dryWrite;
        this.foreignContractCalls = foreignContractCalls;
    }
}
exports.InteractionInput = InteractionInput;
class InteractionOutput {
    constructor(cacheHit, outputState, executionTime, valid, errorMessage = '', gasUsed) {
        this.cacheHit = cacheHit;
        this.outputState = outputState;
        this.executionTime = executionTime;
        this.valid = valid;
        this.errorMessage = errorMessage;
        this.gasUsed = gasUsed;
    }
}
exports.InteractionOutput = InteractionOutput;
//# sourceMappingURL=ContractCallStack.js.map