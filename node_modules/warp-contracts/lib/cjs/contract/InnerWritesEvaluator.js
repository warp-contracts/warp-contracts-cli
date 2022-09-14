"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnerWritesEvaluator = void 0;
class InnerWritesEvaluator {
    eval(callStack) {
        const result = [];
        callStack.interactions.forEach((interaction) => {
            this.evalForeignCalls(callStack.contractTxId, interaction, result);
        });
        return result;
    }
    evalForeignCalls(rootContractTxId, interaction, result) {
        interaction.interactionInput.foreignContractCalls.forEach((foreignContractCall) => {
            foreignContractCall.interactions.forEach((foreignInteraction) => {
                if (foreignInteraction.interactionInput.dryWrite &&
                    !result.includes(foreignContractCall.contractTxId) &&
                    rootContractTxId !== foreignContractCall.contractTxId /*"write-backs"*/) {
                    result.push(foreignContractCall.contractTxId);
                }
                this.evalForeignCalls(rootContractTxId, foreignInteraction, result);
            });
        });
    }
}
exports.InnerWritesEvaluator = InnerWritesEvaluator;
//# sourceMappingURL=InnerWritesEvaluator.js.map