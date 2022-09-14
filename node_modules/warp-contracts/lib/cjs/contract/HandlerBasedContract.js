"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerBasedContract = void 0;
const safe_stable_stringify_1 = __importDefault(require("safe-stable-stringify"));
const crypto = __importStar(require("crypto"));
const ContractCallStack_1 = require("../core/ContractCallStack");
const LexicographicalInteractionsSorter_1 = require("../core/modules/impl/LexicographicalInteractionsSorter");
const StateEvaluator_1 = require("../core/modules/StateEvaluator");
const SmartWeaveTags_1 = require("../core/SmartWeaveTags");
const create_interaction_tx_1 = require("../legacy/create-interaction-tx");
const Benchmark_1 = require("../logging/Benchmark");
const LoggerFactory_1 = require("../logging/LoggerFactory");
const Evolve_1 = require("../plugins/Evolve");
const ArweaveWrapper_1 = require("../utils/ArweaveWrapper");
const utils_1 = require("../utils/utils");
const CreateContract_1 = require("./deploy/CreateContract");
const SourceImpl_1 = require("./deploy/impl/SourceImpl");
const InnerWritesEvaluator_1 = require("./InnerWritesEvaluator");
/**
 * An implementation of {@link Contract} that is backwards compatible with current style
 * of writing SW contracts (ie. using the "handle" function).
 *
 * It requires {@link ExecutorFactory} that is using {@link HandlerApi} generic type.
 */
class HandlerBasedContract {
    constructor(_contractTxId, warp, _parentContract = null, _callingInteraction = null) {
        this._contractTxId = _contractTxId;
        this.warp = warp;
        this._parentContract = _parentContract;
        this._callingInteraction = _callingInteraction;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('HandlerBasedContract');
        this._evaluationOptions = new StateEvaluator_1.DefaultEvaluationOptions();
        this._innerWritesEvaluator = new InnerWritesEvaluator_1.InnerWritesEvaluator();
        this._benchmarkStats = null;
        this.waitForConfirmation = this.waitForConfirmation.bind(this);
        this._arweaveWrapper = new ArweaveWrapper_1.ArweaveWrapper(warp.arweave);
        this._sorter = new LexicographicalInteractionsSorter_1.LexicographicalInteractionsSorter(warp.arweave);
        if (_parentContract != null) {
            this._evaluationOptions = _parentContract.evaluationOptions();
            this._callDepth = _parentContract.callDepth() + 1;
            const interaction = _parentContract.getCallStack().getInteraction(_callingInteraction.id);
            if (this._callDepth > this._evaluationOptions.maxCallDepth) {
                throw Error(`Max call depth of ${this._evaluationOptions.maxCallDepth} has been exceeded for interaction ${JSON.stringify(interaction.interactionInput)}`);
            }
            this.logger.debug('Calling interaction', { id: _callingInteraction.id, sortKey: _callingInteraction.sortKey });
            const callStack = new ContractCallStack_1.ContractCallStack(_contractTxId, this._callDepth);
            interaction.interactionInput.foreignContractCalls.set(_contractTxId, callStack);
            this._callStack = callStack;
            this._rootSortKey = _parentContract.rootSortKey;
        }
        else {
            this._callDepth = 0;
            this._callStack = new ContractCallStack_1.ContractCallStack(_contractTxId, 0);
            this._rootSortKey = null;
        }
    }
    async readState(sortKeyOrBlockHeight, currentTx, interactions) {
        var _a, _b, _c;
        this.logger.info('Read state for', {
            contractTxId: this._contractTxId,
            currentTx,
            sortKeyOrBlockHeight
        });
        const initBenchmark = Benchmark_1.Benchmark.measure();
        this.maybeResetRootContract();
        if (this._parentContract != null && sortKeyOrBlockHeight == null) {
            throw new Error('SortKey MUST be always set for non-root contract calls');
        }
        const { stateEvaluator } = this.warp;
        const sortKey = typeof sortKeyOrBlockHeight == 'number'
            ? this._sorter.generateLastSortKey(sortKeyOrBlockHeight)
            : sortKeyOrBlockHeight;
        const executionContext = await this.createExecutionContext(this._contractTxId, sortKey, false, interactions);
        this.logger.info('Execution Context', {
            srcTxId: (_a = executionContext.contractDefinition) === null || _a === void 0 ? void 0 : _a.srcTxId,
            missingInteractions: (_b = executionContext.sortedInteractions) === null || _b === void 0 ? void 0 : _b.length,
            cachedSortKey: (_c = executionContext.cachedState) === null || _c === void 0 ? void 0 : _c.sortKey
        });
        initBenchmark.stop();
        const stateBenchmark = Benchmark_1.Benchmark.measure();
        const result = await stateEvaluator.eval(executionContext, currentTx || []);
        stateBenchmark.stop();
        const total = initBenchmark.elapsed(true) + stateBenchmark.elapsed(true);
        this._benchmarkStats = {
            gatewayCommunication: initBenchmark.elapsed(true),
            stateEvaluation: stateBenchmark.elapsed(true),
            total
        };
        this.logger.info('Benchmark', {
            'Gateway communication  ': initBenchmark.elapsed(),
            'Contract evaluation    ': stateBenchmark.elapsed(),
            'Total:                 ': `${total.toFixed(0)}ms`
        });
        return result;
    }
    async viewState(input, tags = [], transfer = CreateContract_1.emptyTransfer) {
        this.logger.info('View state for', this._contractTxId);
        return await this.callContract(input, undefined, undefined, tags, transfer);
    }
    async viewStateForTx(input, interactionTx) {
        this.logger.info(`View state for ${this._contractTxId}`, interactionTx);
        return await this.callContractForTx(input, interactionTx);
    }
    async dryWrite(input, caller, tags, transfer) {
        this.logger.info('Dry-write for', this._contractTxId);
        return await this.callContract(input, caller, undefined, tags, transfer);
    }
    async dryWriteFromTx(input, transaction, currentTx) {
        this.logger.info(`Dry-write from transaction ${transaction.id} for ${this._contractTxId}`);
        return await this.callContractForTx(input, transaction, currentTx || []);
    }
    async writeInteraction(input, options) {
        this.logger.info('Write interaction', { input, options });
        if (!this.signer) {
            throw new Error("Wallet not connected. Use 'connect' method first.");
        }
        const { arweave, interactionsLoader } = this.warp;
        const effectiveTags = (options === null || options === void 0 ? void 0 : options.tags) || [];
        const effectiveTransfer = (options === null || options === void 0 ? void 0 : options.transfer) || CreateContract_1.emptyTransfer;
        const effectiveStrict = (options === null || options === void 0 ? void 0 : options.strict) === true;
        const effectiveVrf = (options === null || options === void 0 ? void 0 : options.vrf) === true;
        const effectiveDisableBundling = (options === null || options === void 0 ? void 0 : options.disableBundling) === true;
        const effectiveReward = options === null || options === void 0 ? void 0 : options.reward;
        const bundleInteraction = interactionsLoader.type() == 'warp' && !effectiveDisableBundling;
        if (bundleInteraction &&
            effectiveTransfer.target != CreateContract_1.emptyTransfer.target &&
            effectiveTransfer.winstonQty != CreateContract_1.emptyTransfer.winstonQty) {
            throw new Error('Ar Transfers are not allowed for bundled interactions');
        }
        if (effectiveVrf && !bundleInteraction) {
            throw new Error('Vrf generation is only available for bundle interaction');
        }
        if (bundleInteraction) {
            return await this.bundleInteraction(input, {
                tags: effectiveTags,
                strict: effectiveStrict,
                vrf: effectiveVrf
            });
        }
        else {
            const interactionTx = await this.createInteraction(input, effectiveTags, effectiveTransfer, effectiveStrict, false, false, effectiveReward);
            const response = await arweave.transactions.post(interactionTx);
            if (response.status !== 200) {
                this.logger.error('Error while posting transaction', response);
                return null;
            }
            if (this._evaluationOptions.waitForConfirmation) {
                this.logger.info('Waiting for confirmation of', interactionTx.id);
                const benchmark = Benchmark_1.Benchmark.measure();
                await this.waitForConfirmation(interactionTx.id);
                this.logger.info('Transaction confirmed after', benchmark.elapsed());
            }
            if (this.warp.environment == 'local' && this._evaluationOptions.mineArLocalBlocks) {
                await this.warp.testing.mineBlock();
            }
            return { originalTxId: interactionTx.id };
        }
    }
    async bundleInteraction(input, options) {
        this.logger.info('Bundle interaction input', input);
        const interactionTx = await this.createInteraction(input, options.tags, CreateContract_1.emptyTransfer, options.strict, true, options.vrf);
        const response = await fetch(`${this._evaluationOptions.bundlerUrl}gateway/sequencer/register`, {
            method: 'POST',
            body: JSON.stringify(interactionTx),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => {
            this.logger.debug(res);
            return res.ok ? res.json() : Promise.reject(res);
        })
            .catch((error) => {
            var _a;
            this.logger.error(error);
            if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                this.logger.error(error.body.message);
            }
            throw new Error(`Unable to bundle interaction: ${JSON.stringify(error)}`);
        });
        return {
            bundlrResponse: response,
            originalTxId: interactionTx.id
        };
    }
    async createInteraction(input, tags, transfer, strict, bundle = false, vrf = false, reward) {
        if (this._evaluationOptions.internalWrites) {
            // Call contract and verify if there are any internal writes:
            // 1. Evaluate current contract state
            // 2. Apply input as "dry-run" transaction
            // 3. Verify the callStack and search for any "internalWrites" transactions
            // 4. For each found "internalWrite" transaction - generate additional tag:
            // {name: 'InternalWrite', value: callingContractTxId}
            const handlerResult = await this.callContract(input, undefined, undefined, tags, transfer, strict);
            if (strict && handlerResult.type !== 'ok') {
                throw Error(`Cannot create interaction: ${handlerResult.errorMessage}`);
            }
            const callStack = this.getCallStack();
            const innerWrites = this._innerWritesEvaluator.eval(callStack);
            this.logger.debug('Input', input);
            this.logger.debug('Callstack', callStack.print());
            innerWrites.forEach((contractTxId) => {
                tags.push({
                    name: SmartWeaveTags_1.SmartWeaveTags.INTERACT_WRITE,
                    value: contractTxId
                });
            });
            this.logger.debug('Tags with inner calls', tags);
        }
        else {
            if (strict) {
                const handlerResult = await this.callContract(input, undefined, undefined, tags, transfer, strict);
                if (handlerResult.type !== 'ok') {
                    throw Error(`Cannot create interaction: ${handlerResult.errorMessage}`);
                }
            }
        }
        if (vrf) {
            tags.push({
                name: SmartWeaveTags_1.SmartWeaveTags.REQUEST_VRF,
                value: 'true'
            });
        }
        const interactionTx = await (0, create_interaction_tx_1.createInteractionTx)(this.warp.arweave, this.signer, this._contractTxId, input, tags, transfer.target, transfer.winstonQty, bundle, reward);
        return interactionTx;
    }
    txId() {
        return this._contractTxId;
    }
    getCallStack() {
        return this._callStack;
    }
    connect(signer) {
        if (typeof signer == 'function') {
            this.signer = signer;
        }
        else {
            this.signer = async (tx) => {
                await this.warp.arweave.transactions.sign(tx, signer);
            };
        }
        return this;
    }
    setEvaluationOptions(options) {
        this._evaluationOptions = {
            ...this._evaluationOptions,
            ...options
        };
        return this;
    }
    async waitForConfirmation(transactionId) {
        const { arweave } = this.warp;
        const status = await arweave.transactions.getStatus(transactionId);
        if (status.confirmed === null) {
            this.logger.info(`Transaction ${transactionId} not yet confirmed. Waiting another 20 seconds before next check.`);
            await (0, utils_1.sleep)(20000);
            await this.waitForConfirmation(transactionId);
        }
        else {
            this.logger.info(`Transaction ${transactionId} confirmed`, status);
            return status;
        }
    }
    async createExecutionContext(contractTxId, upToSortKey, forceDefinitionLoad = false, interactions) {
        var _a;
        const { definitionLoader, interactionsLoader, executorFactory, stateEvaluator } = this.warp;
        const benchmark = Benchmark_1.Benchmark.measure();
        const cachedState = await stateEvaluator.latestAvailableState(contractTxId, upToSortKey);
        this.logger.debug('cache lookup', benchmark.elapsed());
        benchmark.reset();
        const evolvedSrcTxId = Evolve_1.Evolve.evolvedSrcTxId((_a = cachedState === null || cachedState === void 0 ? void 0 : cachedState.cachedValue) === null || _a === void 0 ? void 0 : _a.state);
        let handler, contractDefinition, sortedInteractions;
        this.logger.debug('Cached state', cachedState, upToSortKey);
        if (cachedState && cachedState.sortKey == upToSortKey) {
            this.logger.debug('State fully cached, not loading interactions.');
            if (forceDefinitionLoad || evolvedSrcTxId) {
                contractDefinition = await definitionLoader.load(contractTxId, evolvedSrcTxId);
                handler = (await executorFactory.create(contractDefinition, this._evaluationOptions));
            }
        }
        else {
            [contractDefinition, sortedInteractions] = await Promise.all([
                definitionLoader.load(contractTxId, evolvedSrcTxId),
                interactions
                    ? Promise.resolve(interactions)
                    : await interactionsLoader.load(contractTxId, cachedState === null || cachedState === void 0 ? void 0 : cachedState.sortKey, 
                    // (1) we want to eagerly load dependant contract interactions and put them
                    // in the interactions' loader cache
                    // see: https://github.com/warp-contracts/warp/issues/198
                    this.getToSortKey(upToSortKey), this._evaluationOptions)
            ]);
            // (2) ...but we still need to return only interactions up to original "upToSortKey"
            if (cachedState === null || cachedState === void 0 ? void 0 : cachedState.sortKey) {
                sortedInteractions = sortedInteractions.filter((i) => i.sortKey.localeCompare(cachedState === null || cachedState === void 0 ? void 0 : cachedState.sortKey) > 0);
            }
            if (upToSortKey) {
                sortedInteractions = sortedInteractions.filter((i) => i.sortKey.localeCompare(upToSortKey) <= 0);
            }
            this.logger.debug('contract and interactions load', benchmark.elapsed());
            if (this._parentContract == null && sortedInteractions.length) {
                // note: if the root contract has zero interactions, it still should be safe
                // - as no other contracts will be called.
                this._rootSortKey = sortedInteractions[sortedInteractions.length - 1].sortKey;
            }
            handler = (await executorFactory.create(contractDefinition, this._evaluationOptions));
        }
        return {
            warp: this.warp,
            contract: this,
            contractDefinition,
            sortedInteractions,
            evaluationOptions: this._evaluationOptions,
            handler,
            cachedState,
            requestedSortKey: upToSortKey
        };
    }
    getToSortKey(upToSortKey) {
        var _a;
        if ((_a = this._parentContract) === null || _a === void 0 ? void 0 : _a.rootSortKey) {
            if (!upToSortKey) {
                return this._parentContract.rootSortKey;
            }
            return this._parentContract.rootSortKey.localeCompare(upToSortKey) > 0
                ? this._parentContract.rootSortKey
                : upToSortKey;
        }
        else {
            return upToSortKey;
        }
    }
    async createExecutionContextFromTx(contractTxId, transaction) {
        const caller = transaction.owner.address;
        const sortKey = transaction.sortKey;
        const baseContext = await this.createExecutionContext(contractTxId, sortKey, true);
        return {
            ...baseContext,
            caller
        };
    }
    maybeResetRootContract() {
        if (this._parentContract == null) {
            this.logger.debug('Clearing call stack for the root contract');
            this._callStack = new ContractCallStack_1.ContractCallStack(this.txId(), 0);
            this._rootSortKey = null;
            this.warp.interactionsLoader.clearCache();
        }
    }
    async callContract(input, caller, sortKey, tags = [], transfer = CreateContract_1.emptyTransfer, strict = false) {
        this.logger.info('Call contract input', input);
        this.maybeResetRootContract();
        if (!this.signer) {
            this.logger.warn('Wallet not set.');
        }
        const { arweave, stateEvaluator } = this.warp;
        // create execution context
        let executionContext = await this.createExecutionContext(this._contractTxId, sortKey, true);
        const currentBlockData = this.warp.environment == 'mainnet' ? await this._arweaveWrapper.warpGwBlock() : await arweave.blocks.getCurrent();
        // add caller info to execution context
        let effectiveCaller;
        if (caller) {
            effectiveCaller = caller;
        }
        else if (this.signer) {
            const dummyTx = await arweave.createTransaction({
                data: Math.random().toString().slice(-4),
                reward: '72600854',
                last_tx: 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO'
            });
            await this.signer(dummyTx);
            effectiveCaller = await arweave.wallets.ownerToAddress(dummyTx.owner);
        }
        else {
            effectiveCaller = '';
        }
        this.logger.info('effectiveCaller', effectiveCaller);
        executionContext = {
            ...executionContext,
            caller: effectiveCaller
        };
        // eval current state
        const evalStateResult = await stateEvaluator.eval(executionContext, []);
        this.logger.info('Current state', evalStateResult.cachedValue.state);
        // create interaction transaction
        const interaction = {
            input,
            caller: executionContext.caller
        };
        this.logger.debug('interaction', interaction);
        const tx = await (0, create_interaction_tx_1.createInteractionTx)(arweave, this.signer, this._contractTxId, input, tags, transfer.target, transfer.winstonQty, true);
        const dummyTx = (0, create_interaction_tx_1.createDummyTx)(tx, executionContext.caller, currentBlockData);
        this.logger.debug('Creating sortKey for', {
            blockId: dummyTx.block.id,
            id: dummyTx.id,
            height: dummyTx.block.height
        });
        dummyTx.sortKey = await this._sorter.createSortKey(dummyTx.block.id, dummyTx.id, dummyTx.block.height, true);
        dummyTx.strict = strict;
        const handleResult = await this.evalInteraction({
            interaction,
            interactionTx: dummyTx,
            currentTx: []
        }, executionContext, evalStateResult.cachedValue);
        if (handleResult.type !== 'ok') {
            this.logger.fatal('Error while interacting with contract', {
                type: handleResult.type,
                error: handleResult.errorMessage
            });
        }
        return handleResult;
    }
    async callContractForTx(input, interactionTx, currentTx) {
        this.maybeResetRootContract();
        const executionContext = await this.createExecutionContextFromTx(this._contractTxId, interactionTx);
        const evalStateResult = await this.warp.stateEvaluator.eval(executionContext, currentTx);
        this.logger.debug('callContractForTx - evalStateResult', {
            result: evalStateResult.cachedValue.state,
            txId: this._contractTxId
        });
        const interaction = {
            input,
            caller: this._parentContract.txId()
        };
        const interactionData = {
            interaction,
            interactionTx,
            currentTx
        };
        const result = await this.evalInteraction(interactionData, executionContext, evalStateResult.cachedValue);
        result.originalValidity = evalStateResult.cachedValue.validity;
        result.originalErrorMessages = evalStateResult.cachedValue.errorMessages;
        return result;
    }
    async evalInteraction(interactionData, executionContext, evalStateResult) {
        const interactionCall = this.getCallStack().addInteractionData(interactionData);
        const benchmark = Benchmark_1.Benchmark.measure();
        const result = await executionContext.handler.handle(executionContext, evalStateResult, interactionData);
        interactionCall.update({
            cacheHit: false,
            outputState: this._evaluationOptions.stackTrace.saveState ? result.state : undefined,
            executionTime: benchmark.elapsed(true),
            valid: result.type === 'ok',
            errorMessage: result.errorMessage,
            gasUsed: result.gasUsed
        });
        return result;
    }
    parent() {
        return this._parentContract;
    }
    callDepth() {
        return this._callDepth;
    }
    evaluationOptions() {
        return this._evaluationOptions;
    }
    lastReadStateStats() {
        return this._benchmarkStats;
    }
    stateHash(state) {
        const jsonState = (0, safe_stable_stringify_1.default)(state);
        // note: cannot reuse:
        // "The Hash object can not be used again after hash.digest() method has been called.
        // Multiple calls will cause an error to be thrown."
        const hash = crypto.createHash('sha256');
        hash.update(jsonState);
        return hash.digest('hex');
    }
    async syncState(externalUrl, params) {
        const { stateEvaluator } = this.warp;
        const response = await fetch(`${externalUrl}?${new URLSearchParams({
            id: this._contractTxId,
            ...params
        })}`)
            .then((res) => {
            return res.ok ? res.json() : Promise.reject(res);
        })
            .catch((error) => {
            var _a, _b;
            if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                this.logger.error(error.body.message);
            }
            throw new Error(`Unable to retrieve state. ${error.status}: ${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
        });
        await stateEvaluator.syncState(this._contractTxId, response.sortKey, response.state, response.validity);
        return this;
    }
    async evolve(newSrcTxId, options) {
        return await this.writeInteraction({ function: 'evolve', value: newSrcTxId }, options);
    }
    async save(sourceData) {
        if (!this.signer) {
            throw new Error("Wallet not connected. Use 'connect' method first.");
        }
        const { arweave } = this.warp;
        const source = new SourceImpl_1.SourceImpl(arweave);
        const srcTx = await source.save(sourceData, this.signer);
        return srcTx.id;
    }
    get callingInteraction() {
        return this._callingInteraction;
    }
    get rootSortKey() {
        return this._rootSortKey;
    }
}
exports.HandlerBasedContract = HandlerBasedContract;
//# sourceMappingURL=HandlerBasedContract.js.map