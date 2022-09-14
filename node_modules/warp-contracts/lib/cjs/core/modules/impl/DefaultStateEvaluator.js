"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultStateEvaluator = void 0;
const vrf_js_1 = require("@idena/vrf-js");
const elliptic_1 = __importDefault(require("elliptic"));
const SortKeyCache_1 = require("../../../cache/SortKeyCache");
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const utils_1 = require("../../../utils/utils");
const StateEvaluator_1 = require("../StateEvaluator");
const StateCache_1 = require("./StateCache");
const TagsParser_1 = require("./TagsParser");
const EC = new elliptic_1.default.ec('secp256k1');
/**
 * This class contains the base functionality of evaluating the contracts state - according
 * to the SmartWeave protocol.
 * Marked as abstract - as without help of any cache - the evaluation in real-life applications
 * would be really slow - so using this class without any caching ({@link CacheableStateEvaluator})
 * mechanism built on top makes no sense.
 */
class DefaultStateEvaluator {
    constructor(arweave, executionContextModifiers = []) {
        this.arweave = arweave;
        this.executionContextModifiers = executionContextModifiers;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('DefaultStateEvaluator');
        this.tagsParser = new TagsParser_1.TagsParser();
    }
    async eval(executionContext, currentTx) {
        return this.doReadState(executionContext.sortedInteractions, new StateEvaluator_1.EvalStateResult(executionContext.contractDefinition.initState, {}, {}), executionContext, currentTx);
    }
    async doReadState(missingInteractions, baseState, executionContext, currentTx) {
        var _a;
        const { ignoreExceptions, stackTrace, internalWrites } = executionContext.evaluationOptions;
        const { contract, contractDefinition, sortedInteractions } = executionContext;
        let currentState = baseState.state;
        let currentSortKey = null;
        const validity = baseState.validity;
        const errorMessages = baseState.errorMessages;
        executionContext === null || executionContext === void 0 ? void 0 : executionContext.handler.initState(currentState);
        const depth = executionContext.contract.callDepth();
        this.logger.info(`${(0, utils_1.indent)(depth)}Evaluating state for ${contractDefinition.txId} [${missingInteractions.length} non-cached of ${sortedInteractions.length} all]`);
        let errorMessage = null;
        let lastConfirmedTxState = null;
        const missingInteractionsLength = missingInteractions.length;
        executionContext.handler.initState(currentState);
        for (let i = 0; i < missingInteractionsLength; i++) {
            const missingInteraction = missingInteractions[i];
            const singleInteractionBenchmark = Benchmark_1.Benchmark.measure();
            currentSortKey = missingInteraction.sortKey;
            if (missingInteraction.vrf) {
                if (!this.verifyVrf(missingInteraction.vrf, missingInteraction.sortKey, this.arweave)) {
                    throw new Error('Vrf verification failed.');
                }
            }
            this.logger.debug(`${(0, utils_1.indent)(depth)}[${contractDefinition.txId}][${missingInteraction.id}][${missingInteraction.block.height}]: ${missingInteractions.indexOf(missingInteraction) + 1}/${missingInteractions.length} [of all:${sortedInteractions.length}]`);
            const isInteractWrite = this.tagsParser.isInteractWrite(missingInteraction, contractDefinition.txId);
            // other contract makes write ("writing contract") on THIS contract
            if (isInteractWrite && internalWrites) {
                // evaluating txId of the contract that is writing on THIS contract
                const writingContractTxId = this.tagsParser.getContractTag(missingInteraction);
                this.logger.debug(`${(0, utils_1.indent)(depth)}Internal Write - Loading writing contract`, writingContractTxId);
                const interactionCall = contract
                    .getCallStack()
                    .addInteractionData({ interaction: null, interactionTx: missingInteraction, currentTx });
                // creating a Contract instance for the "writing" contract
                const writingContract = executionContext.warp.contract(writingContractTxId, executionContext.contract, missingInteraction);
                await this.onContractCall(missingInteraction, executionContext, new StateEvaluator_1.EvalStateResult(currentState, validity, errorMessages));
                this.logger.debug(`${(0, utils_1.indent)(depth)}Reading state of the calling contract at`, missingInteraction.sortKey);
                /**
                 Reading the state of the writing contract.
                 This in turn will cause the state of THIS contract to be
                 updated in cache - see {@link ContractHandlerApi.assignWrite}
                 */
                await writingContract.readState(missingInteraction.sortKey, [
                    ...(currentTx || []),
                    {
                        contractTxId: contractDefinition.txId,
                        interactionTxId: missingInteraction.id
                    }
                ]);
                // loading latest state of THIS contract from cache
                const newState = await this.internalWriteState(contractDefinition.txId, missingInteraction.sortKey);
                if (newState !== null) {
                    currentState = newState.cachedValue.state;
                    // we need to update the state in the wasm module
                    executionContext === null || executionContext === void 0 ? void 0 : executionContext.handler.initState(currentState);
                    validity[missingInteraction.id] = newState.cachedValue.validity[missingInteraction.id];
                    if ((_a = newState.cachedValue.errorMessages) === null || _a === void 0 ? void 0 : _a[missingInteraction.id]) {
                        errorMessages[missingInteraction.id] = newState.cachedValue.errorMessages[missingInteraction.id];
                    }
                    const toCache = new StateEvaluator_1.EvalStateResult(currentState, validity, errorMessages);
                    await this.onStateUpdate(missingInteraction, executionContext, toCache);
                    if ((0, StateCache_1.canBeCached)(missingInteraction)) {
                        lastConfirmedTxState = {
                            tx: missingInteraction,
                            state: toCache
                        };
                    }
                }
                else {
                    validity[missingInteraction.id] = false;
                }
                interactionCall.update({
                    cacheHit: false,
                    outputState: stackTrace.saveState ? currentState : undefined,
                    executionTime: singleInteractionBenchmark.elapsed(true),
                    valid: validity[missingInteraction.id],
                    errorMessage: errorMessage,
                    gasUsed: 0 // TODO...
                });
            }
            else {
                // "direct" interaction with this contract - "standard" processing
                const inputTag = this.tagsParser.getInputTag(missingInteraction, executionContext.contractDefinition.txId);
                if (!inputTag) {
                    this.logger.error(`${(0, utils_1.indent)(depth)}Skipping tx - Input tag not found for ${missingInteraction.id}`);
                    continue;
                }
                const input = this.parseInput(inputTag);
                if (!input) {
                    this.logger.error(`${(0, utils_1.indent)(depth)}Skipping tx - invalid Input tag - ${missingInteraction.id}`);
                    continue;
                }
                const interaction = {
                    input,
                    caller: missingInteraction.owner.address
                };
                const interactionData = {
                    interaction,
                    interactionTx: missingInteraction,
                    currentTx
                };
                this.logger.debug(`${(0, utils_1.indent)(depth)}Interaction:`, interaction);
                const interactionCall = contract.getCallStack().addInteractionData(interactionData);
                const result = await executionContext.handler.handle(executionContext, new StateEvaluator_1.EvalStateResult(currentState, validity, errorMessages), interactionData);
                errorMessage = result.errorMessage;
                if (result.type !== 'ok') {
                    errorMessages[missingInteraction.id] = errorMessage;
                }
                this.logResult(result, missingInteraction, executionContext);
                this.logger.debug(`${(0, utils_1.indent)(depth)}Interaction evaluation`, singleInteractionBenchmark.elapsed());
                interactionCall.update({
                    cacheHit: false,
                    outputState: stackTrace.saveState ? currentState : undefined,
                    executionTime: singleInteractionBenchmark.elapsed(true),
                    valid: validity[missingInteraction.id],
                    errorMessage: errorMessage,
                    gasUsed: result.gasUsed
                });
                if (result.type === 'exception' && ignoreExceptions !== true) {
                    throw new Error(`Exception while processing ${JSON.stringify(interaction)}:\n${result.errorMessage}`);
                }
                validity[missingInteraction.id] = result.type === 'ok';
                currentState = result.state;
                const toCache = new StateEvaluator_1.EvalStateResult(currentState, validity, errorMessages);
                if ((0, StateCache_1.canBeCached)(missingInteraction)) {
                    lastConfirmedTxState = {
                        tx: missingInteraction,
                        state: toCache
                    };
                }
                await this.onStateUpdate(missingInteraction, executionContext, toCache);
            }
            for (const { modify } of this.executionContextModifiers) {
                executionContext = await modify(currentState, executionContext);
            }
        }
        const evalStateResult = new StateEvaluator_1.EvalStateResult(currentState, validity, errorMessages);
        // state could have been fully retrieved from cache
        // or there were no interactions below requested block height
        if (lastConfirmedTxState !== null) {
            await this.onStateEvaluated(lastConfirmedTxState.tx, executionContext, lastConfirmedTxState.state);
        }
        return new SortKeyCache_1.SortKeyCacheResult(currentSortKey, evalStateResult);
    }
    verifyVrf(vrf, sortKey, arweave) {
        const keys = EC.keyFromPublic(vrf.pubkey, 'hex');
        let hash;
        try {
            // ProofHoHash throws its own 'invalid vrf' exception
            hash = (0, vrf_js_1.ProofHoHash)(keys.getPublic(), arweave.utils.stringToBuffer(sortKey), arweave.utils.b64UrlToBuffer(vrf.proof));
        }
        catch (e) {
            return false;
        }
        return arweave.utils.bufferTob64Url(hash) == vrf.index;
    }
    logResult(result, currentTx, executionContext) {
        if (result.type === 'exception') {
            this.logger.error(`Executing of interaction: [${executionContext.contractDefinition.txId} -> ${currentTx.id}] threw exception:`, `${result.errorMessage}`);
        }
        if (result.type === 'error') {
            this.logger.warn(`Executing of interaction: [${executionContext.contractDefinition.txId} -> ${currentTx.id}] returned error:`, result.errorMessage);
        }
    }
    parseInput(inputTag) {
        try {
            return JSON.parse(inputTag.value);
        }
        catch (e) {
            this.logger.error(e);
            return null;
        }
    }
}
exports.DefaultStateEvaluator = DefaultStateEvaluator;
//# sourceMappingURL=DefaultStateEvaluator.js.map