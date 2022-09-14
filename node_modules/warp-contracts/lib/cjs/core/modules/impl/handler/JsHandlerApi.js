"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsHandlerApi = void 0;
const utils_1 = require("../../../../utils/utils");
const AbstractContractHandler_1 = require("./AbstractContractHandler");
class JsHandlerApi extends AbstractContractHandler_1.AbstractContractHandler {
    constructor(swGlobal, contractDefinition, 
    // eslint-disable-next-line
    contractFunction) {
        super(swGlobal, contractDefinition);
        this.contractFunction = contractFunction;
    }
    async handle(executionContext, currentResult, interactionData) {
        const { timeoutId, timeoutPromise } = (0, utils_1.timeout)(executionContext.evaluationOptions.maxInteractionEvaluationTimeSeconds);
        try {
            const { interaction, interactionTx, currentTx } = interactionData;
            const stateCopy = (0, utils_1.deepCopy)(currentResult.state, executionContext.evaluationOptions.useFastCopy);
            this.swGlobal._activeTx = interactionTx;
            this.swGlobal.caller = interaction.caller; // either contract tx id (for internal writes) or transaction.owner
            this.assignReadContractState(executionContext, currentTx, currentResult, interactionTx);
            this.assignViewContractState(executionContext);
            this.assignWrite(executionContext, currentTx);
            this.assignRefreshState(executionContext);
            const handlerResult = await Promise.race([timeoutPromise, this.contractFunction(stateCopy, interaction)]);
            if (handlerResult && (handlerResult.state !== undefined || handlerResult.result !== undefined)) {
                return {
                    type: 'ok',
                    result: handlerResult.result,
                    state: handlerResult.state || currentResult.state
                };
            }
            // Will be caught below as unexpected exception.
            throw new Error(`Unexpected result from contract: ${JSON.stringify(handlerResult)}`);
        }
        catch (err) {
            switch (err.name) {
                case 'ContractError':
                    return {
                        type: 'error',
                        errorMessage: err.message,
                        state: currentResult.state,
                        // note: previous version was writing error message to a "result" field,
                        // which fucks-up the HandlerResult type definition -
                        // HandlerResult.result had to be declared as 'Result | string' - and that led to a poor dev exp.
                        // TODO: this might be breaking change!
                        result: null
                    };
                default:
                    return {
                        type: 'exception',
                        errorMessage: `${(err && err.stack) || (err && err.message) || err}`,
                        state: currentResult.state,
                        result: null
                    };
            }
        }
        finally {
            if (timeoutId !== null) {
                // it is important to clear the timeout promise
                // - promise.race won't "cancel" it automatically if the "handler" promise "wins"
                // - and this would ofc. cause a waste in cpu cycles
                // (+ Jest complains about async operations not being stopped properly).
                clearTimeout(timeoutId);
            }
        }
    }
    initState(state) {
        // nth to do in this impl...
    }
}
exports.JsHandlerApi = JsHandlerApi;
//# sourceMappingURL=JsHandlerApi.js.map