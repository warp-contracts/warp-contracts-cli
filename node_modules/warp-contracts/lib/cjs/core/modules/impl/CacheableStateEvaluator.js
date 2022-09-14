"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableStateEvaluator = void 0;
const SortKeyCache_1 = require("../../../cache/SortKeyCache");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const utils_1 = require("../../../utils/utils");
const StateEvaluator_1 = require("../StateEvaluator");
const DefaultStateEvaluator_1 = require("./DefaultStateEvaluator");
const LexicographicalInteractionsSorter_1 = require("./LexicographicalInteractionsSorter");
/**
 * An implementation of DefaultStateEvaluator that adds caching capabilities.
 *
 * The main responsibility of this class is to compute whether there are
 * any interaction transactions, for which the state hasn't been evaluated yet -
 * if so - it generates a list of such transactions and evaluates the state
 * for them - taking as an input state the last cached state.
 */
class CacheableStateEvaluator extends DefaultStateEvaluator_1.DefaultStateEvaluator {
    constructor(arweave, cache, executionContextModifiers = []) {
        super(arweave, executionContextModifiers);
        this.cache = cache;
        this.cLogger = LoggerFactory_1.LoggerFactory.INST.create('CacheableStateEvaluator');
    }
    async eval(executionContext, currentTx) {
        var _a, _b, _c, _d;
        const cachedState = executionContext.cachedState;
        if (cachedState && cachedState.sortKey == executionContext.requestedSortKey) {
            this.cLogger.info(`Exact cache hit for sortKey ${(_a = executionContext === null || executionContext === void 0 ? void 0 : executionContext.contractDefinition) === null || _a === void 0 ? void 0 : _a.txId}:${cachedState.sortKey}`);
            (_b = executionContext.handler) === null || _b === void 0 ? void 0 : _b.initState(cachedState.cachedValue.state);
            return cachedState;
        }
        const missingInteractions = executionContext.sortedInteractions;
        // TODO: this is tricky part, needs proper description
        // for now: it prevents from infinite loop calls between calls that are making
        // internal interact writes.
        const contractTxId = executionContext.contractDefinition.txId;
        // sanity check...
        if (!contractTxId) {
            throw new Error('Contract tx id not set in the execution context');
        }
        for (const entry of currentTx || []) {
            if (entry.contractTxId === executionContext.contractDefinition.txId) {
                const index = missingInteractions.findIndex((tx) => tx.id === entry.interactionTxId);
                if (index !== -1) {
                    this.cLogger.debug('Inf. Loop fix - removing interaction', {
                        height: missingInteractions[index].block.height,
                        contractTxId: entry.contractTxId,
                        interactionTxId: entry.interactionTxId,
                        sortKey: missingInteractions[index].sortKey
                    });
                    missingInteractions.splice(index);
                }
            }
        }
        if (missingInteractions.length == 0) {
            this.cLogger.info(`No missing interactions ${contractTxId}`);
            if (cachedState) {
                (_c = executionContext.handler) === null || _c === void 0 ? void 0 : _c.initState(cachedState.cachedValue.state);
                return cachedState;
            }
            else {
                (_d = executionContext.handler) === null || _d === void 0 ? void 0 : _d.initState(executionContext.contractDefinition.initState);
                this.cLogger.debug('Inserting initial state into cache');
                const stateToCache = new StateEvaluator_1.EvalStateResult(executionContext.contractDefinition.initState, {}, {});
                // no real sort-key - as we're returning the initial state
                await this.cache.put(new SortKeyCache_1.CacheKey(contractTxId, LexicographicalInteractionsSorter_1.genesisSortKey), stateToCache);
                return new SortKeyCache_1.SortKeyCacheResult(LexicographicalInteractionsSorter_1.genesisSortKey, stateToCache);
            }
        }
        const baseState = cachedState == null ? executionContext.contractDefinition.initState : cachedState.cachedValue.state;
        const baseValidity = cachedState == null ? {} : cachedState.cachedValue.validity;
        const baseErrorMessages = cachedState == null ? {} : cachedState.cachedValue.errorMessages;
        this.cLogger.debug('Base state', baseState);
        // eval state for the missing transactions - starting from the latest value from cache.
        return await this.doReadState(missingInteractions, new StateEvaluator_1.EvalStateResult(baseState, baseValidity, baseErrorMessages || {}), executionContext, currentTx);
    }
    async onStateEvaluated(transaction, executionContext, state) {
        const contractTxId = executionContext.contractDefinition.txId;
        this.cLogger.debug(`${(0, utils_1.indent)(executionContext.contract.callDepth())}onStateEvaluated: cache update for contract ${contractTxId} [${transaction.sortKey}]`);
        // this will be problematic if we decide to cache only "onStateEvaluated" and containsInteractionsFromSequencer = true
        // as a workaround, we're now caching every 100 interactions
        await this.putInCache(contractTxId, transaction, state);
    }
    async onStateUpdate(transaction, executionContext, state, force = false) {
        if (executionContext.evaluationOptions.updateCacheForEachInteraction || force) {
            this.cLogger.debug(`onStateUpdate: cache update for contract ${executionContext.contractDefinition.txId} [${transaction.sortKey}]`, {
                contract: executionContext.contractDefinition.txId,
                state: state.state,
                sortKey: transaction.sortKey
            });
            await this.putInCache(executionContext.contractDefinition.txId, transaction, state);
        }
    }
    async latestAvailableState(contractTxId, sortKey) {
        this.cLogger.debug('Searching for', { contractTxId, sortKey });
        if (sortKey) {
            const stateCache = (await this.cache.getLessOrEqual(contractTxId, sortKey));
            if (stateCache) {
                this.cLogger.debug(`Latest available state at ${contractTxId}: ${stateCache.sortKey}`);
            }
            return stateCache;
        }
        else {
            return (await this.cache.getLast(contractTxId));
        }
    }
    async onInternalWriteStateUpdate(transaction, contractTxId, state) {
        this.cLogger.debug('Internal write state update:', {
            sortKey: transaction.sortKey,
            dry: transaction.dry,
            contractTxId,
            state: state.state
        });
        await this.putInCache(contractTxId, transaction, state);
    }
    async onContractCall(transaction, executionContext, state) {
        var _a;
        if (((_a = executionContext.sortedInteractions) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return;
        }
        const txIndex = executionContext.sortedInteractions.indexOf(transaction);
        if (txIndex < 1) {
            return;
        }
        await this.putInCache(executionContext.contractDefinition.txId, executionContext.sortedInteractions[txIndex - 1], state);
    }
    async putInCache(contractTxId, transaction, state) {
        if (transaction.dry) {
            return;
        }
        if (transaction.confirmationStatus !== undefined && transaction.confirmationStatus !== 'confirmed') {
            return;
        }
        const stateToCache = new StateEvaluator_1.EvalStateResult(state.state, state.validity, state.errorMessages || {});
        this.cLogger.debug('Putting into cache', {
            contractTxId,
            transaction: transaction.id,
            sortKey: transaction.sortKey,
            dry: transaction.dry,
            state: stateToCache.state,
            validity: stateToCache.validity
        });
        await this.cache.put(new SortKeyCache_1.CacheKey(contractTxId, transaction.sortKey), stateToCache);
    }
    async syncState(contractTxId, sortKey, state, validity) {
        const stateToCache = new StateEvaluator_1.EvalStateResult(state, validity, {});
        await this.cache.put(new SortKeyCache_1.CacheKey(contractTxId, sortKey), stateToCache);
    }
    async dumpCache() {
        return await this.cache.dump();
    }
    async internalWriteState(contractTxId, sortKey) {
        return (await this.cache.get(contractTxId, sortKey));
    }
    async hasContractCached(contractTxId) {
        return (await this.cache.getLast(contractTxId)) != null;
    }
    async lastCachedSortKey() {
        return await this.cache.getLastSortKey();
    }
    async allCachedContracts() {
        return await this.cache.allContracts();
    }
}
exports.CacheableStateEvaluator = CacheableStateEvaluator;
//# sourceMappingURL=CacheableStateEvaluator.js.map