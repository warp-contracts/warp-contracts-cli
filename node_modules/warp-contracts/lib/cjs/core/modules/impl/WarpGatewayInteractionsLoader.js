"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpGatewayInteractionsLoader = exports.SourceType = void 0;
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
require("redstone-isomorphic");
const utils_1 = require("../../../utils/utils");
var SourceType;
(function (SourceType) {
    SourceType["ARWEAVE"] = "arweave";
    SourceType["WARP_SEQUENCER"] = "redstone-sequencer";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
/**
 * The aim of this implementation of the {@link InteractionsLoader} is to make use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * endpoint and retrieve contracts' interactions.
 *
 * Optionally - it is possible to pass:
 * 1. {@link ConfirmationStatus.confirmed} flag - to receive only confirmed interactions - ie. interactions with
 * enough confirmations, whose existence is confirmed by at least 3 Arweave peers.
 * 2. {@link ConfirmationStatus.notCorrupted} flag - to receive both already confirmed and not yet confirmed (ie. latest)
 * interactions.
 * 3. {@link SourceType} - to receive interactions based on their origin ({@link SourceType.ARWEAVE} or {@link SourceType.REDSTONE_SEQUENCER}).
 * If not set, interactions from all sources will be loaded.
 *
 * Passing no flag is the "backwards compatible" mode (ie. it will behave like the original Arweave GQL gateway endpoint).
 * Note that this may result in returning corrupted and/or forked interactions
 * - read more {@link https://github.com/warp-contracts/redstone-sw-gateway#corrupted-transactions}.
 */
class WarpGatewayInteractionsLoader {
    constructor(baseUrl, confirmationStatus = null, source = null) {
        this.baseUrl = baseUrl;
        this.confirmationStatus = confirmationStatus;
        this.source = source;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('WarpGatewayInteractionsLoader');
        this.baseUrl = (0, utils_1.stripTrailingSlash)(baseUrl);
        Object.assign(this, confirmationStatus);
        this.source = source;
    }
    async load(contractId, fromSortKey, toSortKey, evaluationOptions) {
        this.logger.debug('Loading interactions: for ', { contractId, fromSortKey, toSortKey });
        const interactions = [];
        let page = 0;
        let limit = 0;
        let items = 0;
        const benchmarkTotalTime = Benchmark_1.Benchmark.measure();
        do {
            const benchmarkRequestTime = Benchmark_1.Benchmark.measure();
            const url = `${this.baseUrl}/gateway/v2/interactions-sort-key`;
            const response = await fetch(`${url}?${new URLSearchParams({
                contractId: contractId,
                ...(fromSortKey ? { from: fromSortKey } : ''),
                ...(toSortKey ? { to: toSortKey } : ''),
                page: (++page).toString(),
                fromSdk: 'true',
                ...(this.confirmationStatus && this.confirmationStatus.confirmed ? { confirmationStatus: 'confirmed' } : ''),
                ...(this.confirmationStatus && this.confirmationStatus.notCorrupted
                    ? { confirmationStatus: 'not_corrupted' }
                    : ''),
                ...(this.source ? { source: this.source } : '')
            })}`)
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.logger.error(error.body.message);
                }
                throw new Error(`Unable to retrieve transactions. Warp gateway responded with status ${error.status}.`);
            });
            this.logger.debug(`Loading interactions: page ${page} loaded in ${benchmarkRequestTime.elapsed()}`);
            interactions.push(...response.interactions);
            limit = response.paging.limit;
            items = response.paging.items;
            this.logger.debug(`Loaded interactions length: ${interactions.length}, from: ${fromSortKey}, to: ${toSortKey}`);
        } while (items == limit); // note: items < limit means that we're on the last page
        this.logger.debug('All loaded interactions:', {
            from: fromSortKey,
            to: toSortKey,
            loaded: interactions.length,
            time: benchmarkTotalTime.elapsed()
        });
        return interactions;
    }
    type() {
        return 'warp';
    }
    clearCache() {
        // noop
    }
}
exports.WarpGatewayInteractionsLoader = WarpGatewayInteractionsLoader;
//# sourceMappingURL=WarpGatewayInteractionsLoader.js.map