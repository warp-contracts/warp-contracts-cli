"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractContractHandler = void 0;
const Contract_1 = require("../../../../contract/Contract");
const LoggerFactory_1 = require("../../../../logging/LoggerFactory");
const utils_1 = require("../../../../utils/utils");
class AbstractContractHandler {
    constructor(swGlobal, contractDefinition) {
        this.swGlobal = swGlobal;
        this.contractDefinition = contractDefinition;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('ContractHandler');
        this.assignReadContractState = this.assignReadContractState.bind(this);
        this.assignViewContractState = this.assignViewContractState.bind(this);
        this.assignWrite = this.assignWrite.bind(this);
        this.assignRefreshState = this.assignRefreshState.bind(this);
    }
    async dispose() {
        // noop by default;
    }
    assignWrite(executionContext, currentTx) {
        this.swGlobal.contracts.write = async (contractTxId, input, throwOnError) => {
            if (!executionContext.evaluationOptions.internalWrites) {
                throw new Error("Internal writes feature switched off. Change EvaluationOptions.internalWrites flag to 'true'");
            }
            const effectiveThrowOnError = throwOnError == undefined ? executionContext.evaluationOptions.throwOnInternalWriteError : throwOnError;
            const debugData = {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            };
            this.logger.debug('swGlobal.write call:', debugData);
            // The contract that we want to call and modify its state
            const calleeContract = executionContext.warp.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            const result = await calleeContract.dryWriteFromTx(input, this.swGlobal._activeTx, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            this.logger.debug('Cache result?:', !this.swGlobal._activeTx.dry);
            const shouldAutoThrow = result.type !== 'ok' &&
                effectiveThrowOnError &&
                (!this.swGlobal._activeTx.dry || (this.swGlobal._activeTx.dry && this.swGlobal._activeTx.strict));
            const effectiveErrorMessage = shouldAutoThrow
                ? `Internal write auto error for call [${JSON.stringify(debugData)}]: ${result.errorMessage}`
                : result.errorMessage;
            await executionContext.warp.stateEvaluator.onInternalWriteStateUpdate(this.swGlobal._activeTx, contractTxId, {
                state: result.state,
                validity: {
                    ...result.originalValidity,
                    [this.swGlobal._activeTx.id]: result.type == 'ok'
                },
                errorMessages: {
                    ...result.originalErrorMessages,
                    [this.swGlobal._activeTx.id]: effectiveErrorMessage
                }
            });
            if (shouldAutoThrow) {
                throw new Contract_1.ContractError(effectiveErrorMessage);
            }
            return result;
        };
    }
    assignViewContractState(executionContext) {
        this.swGlobal.contracts.viewContractState = async (contractTxId, input) => {
            this.logger.debug('swGlobal.viewContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            });
            const childContract = executionContext.warp.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            return await childContract.viewStateForTx(input, this.swGlobal._activeTx);
        };
    }
    assignReadContractState(executionContext, currentTx, currentResult, interactionTx) {
        this.swGlobal.contracts.readContractState = async (contractTxId, returnValidity) => {
            this.logger.debug('swGlobal.readContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                sortKey: interactionTx.sortKey,
                transaction: this.swGlobal.transaction.id
            });
            const { stateEvaluator } = executionContext.warp;
            const childContract = executionContext.warp.contract(contractTxId, executionContext.contract, interactionTx);
            await stateEvaluator.onContractCall(interactionTx, executionContext, currentResult);
            const stateWithValidity = await childContract.readState(interactionTx.sortKey, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            // TODO: it should be up to the client's code to decide which part of the result to use
            // (by simply using destructuring operator)...
            // but this (i.e. returning always stateWithValidity from here) would break backwards compatibility
            // in current contract's source code..:/
            return returnValidity ? (0, utils_1.deepCopy)(stateWithValidity) : (0, utils_1.deepCopy)(stateWithValidity.cachedValue.state);
        };
    }
    assignRefreshState(executionContext) {
        this.swGlobal.contracts.refreshState = async () => {
            const stateEvaluator = executionContext.warp.stateEvaluator;
            const result = await stateEvaluator.latestAvailableState(this.swGlobal.contract.id, this.swGlobal._activeTx.sortKey);
            return result === null || result === void 0 ? void 0 : result.cachedValue.state;
        };
    }
}
exports.AbstractContractHandler = AbstractContractHandler;
//# sourceMappingURL=AbstractContractHandler.js.map