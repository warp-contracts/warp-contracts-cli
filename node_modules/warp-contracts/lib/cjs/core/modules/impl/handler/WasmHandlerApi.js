"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmHandlerApi = void 0;
const safe_stable_stringify_1 = __importDefault(require("safe-stable-stringify"));
const AbstractContractHandler_1 = require("./AbstractContractHandler");
class WasmHandlerApi extends AbstractContractHandler_1.AbstractContractHandler {
    constructor(swGlobal, 
    // eslint-disable-next-line
    contractDefinition, wasmExports) {
        super(swGlobal, contractDefinition);
        this.wasmExports = wasmExports;
    }
    async handle(executionContext, currentResult, interactionData) {
        try {
            const { interaction, interactionTx, currentTx } = interactionData;
            this.swGlobal._activeTx = interactionTx;
            this.swGlobal.caller = interaction.caller; // either contract tx id (for internal writes) or transaction.owner
            this.swGlobal.gasLimit = executionContext.evaluationOptions.gasLimit;
            this.swGlobal.gasUsed = 0;
            this.assignReadContractState(executionContext, currentTx, currentResult, interactionTx);
            this.assignWrite(executionContext, currentTx);
            const handlerResult = await this.doHandle(interaction);
            return {
                type: 'ok',
                result: handlerResult,
                state: this.doGetCurrentState(),
                gasUsed: this.swGlobal.gasUsed
            };
        }
        catch (e) {
            // note: as exceptions handling in WASM is currently somewhat non-existent
            // https://www.assemblyscript.org/status.html#exceptions
            // and since we have to somehow differentiate different types of exceptions
            // - each exception message has to have a proper prefix added.
            // exceptions with prefix [RE:] ("Runtime Exceptions") should break the execution immediately
            // - eg: [RE:OOG] - [RuntimeException: OutOfGas]
            // exception with prefix [CE:] ("Contract Exceptions") should be logged, but should not break
            // the state evaluation - as they are considered as contracts' business exception (eg. validation errors)
            // - eg: [CE:ITT] - [ContractException: InvalidTokenTransfer]
            const result = {
                errorMessage: e.message,
                state: currentResult.state,
                result: null
            };
            if (e.message.startsWith('[RE:')) {
                this.logger.fatal(e);
                return {
                    ...result,
                    type: 'exception'
                };
            }
            else {
                return {
                    ...result,
                    type: 'error'
                };
            }
        }
    }
    initState(state) {
        switch (this.contractDefinition.srcWasmLang) {
            case 'assemblyscript': {
                const statePtr = this.wasmExports.__newString((0, safe_stable_stringify_1.default)(state));
                this.wasmExports.initState(statePtr);
                break;
            }
            case 'rust': {
                this.wasmExports.initState(state);
                break;
            }
            case 'go': {
                this.wasmExports.initState((0, safe_stable_stringify_1.default)(state));
                break;
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
    async doHandle(action) {
        switch (this.contractDefinition.srcWasmLang) {
            case 'assemblyscript': {
                const actionPtr = this.wasmExports.__newString((0, safe_stable_stringify_1.default)(action.input));
                const resultPtr = this.wasmExports.handle(actionPtr);
                const result = this.wasmExports.__getString(resultPtr);
                return JSON.parse(result);
            }
            case 'rust': {
                let handleResult = await this.wasmExports.handle(action.input);
                if (!handleResult) {
                    return;
                }
                if (Object.prototype.hasOwnProperty.call(handleResult, 'Ok')) {
                    return handleResult.Ok;
                }
                else {
                    this.logger.debug('Error from rust', handleResult.Err);
                    let errorKey;
                    let errorArgs = '';
                    if (typeof handleResult.Err === 'string' || handleResult.Err instanceof String) {
                        errorKey = handleResult.Err;
                    }
                    else {
                        errorKey = Object.keys(handleResult.Err)[0];
                        errorArgs = ' ' + handleResult.Err[errorKey];
                    }
                    if (errorKey == 'RuntimeError') {
                        throw new Error(`[RE:RE]${errorArgs}`);
                    }
                    else {
                        throw new Error(`[CE:${errorKey}${errorArgs}]`);
                    }
                }
            }
            case 'go': {
                const result = await this.wasmExports.handle((0, safe_stable_stringify_1.default)(action.input));
                return JSON.parse(result);
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
    doGetCurrentState() {
        switch (this.contractDefinition.srcWasmLang) {
            case 'assemblyscript': {
                const currentStatePtr = this.wasmExports.currentState();
                return JSON.parse(this.wasmExports.__getString(currentStatePtr));
            }
            case 'rust': {
                return this.wasmExports.currentState();
            }
            case 'go': {
                const result = this.wasmExports.currentState();
                return JSON.parse(result);
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
}
exports.WasmHandlerApi = WasmHandlerApi;
//# sourceMappingURL=WasmHandlerApi.js.map