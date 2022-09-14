"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultEvaluationOptions = exports.EvalStateResult = void 0;
class EvalStateResult {
    constructor(state, validity, errorMessages) {
        this.state = state;
        this.validity = validity;
        this.errorMessages = errorMessages;
    }
}
exports.EvalStateResult = EvalStateResult;
class DefaultEvaluationOptions {
    constructor() {
        // default = true - still cannot decide whether true or false should be the default.
        // "false" may lead to some fairly simple attacks on contract, if the contract
        // does not properly validate input data.
        // "true" may lead to wrongly calculated state, even without noticing the problem
        // (e.g. when using unsafe client and Arweave does not respond properly for a while)
        this.ignoreExceptions = true;
        this.waitForConfirmation = false;
        this.updateCacheForEachInteraction = false;
        this.internalWrites = false;
        this.maxCallDepth = 7; // your lucky number...
        this.maxInteractionEvaluationTimeSeconds = 60;
        this.stackTrace = {
            saveState: false
        };
        this.bundlerUrl = `https://d1o5nlqr4okus2.cloudfront.net/`;
        this.gasLimit = Number.MAX_SAFE_INTEGER;
        this.useFastCopy = true;
        this.useVM2 = false;
        this.allowUnsafeClient = false;
        this.allowBigInt = false;
        this.walletBalanceUrl = 'http://nyc-1.dev.arweave.net:1984/';
        this.mineArLocalBlocks = true;
        this.throwOnInternalWriteError = true;
    }
}
exports.DefaultEvaluationOptions = DefaultEvaluationOptions;
//# sourceMappingURL=StateEvaluator.js.map