"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackTags = exports.createDummyTx = exports.createInteractionTx = void 0;
const SmartWeaveTags_1 = require("../core/SmartWeaveTags");
async function createInteractionTx(arweave, signer, contractId, input, tags, target = '', winstonQty = '0', dummy = false, reward) {
    const options = {
        data: Math.random().toString().slice(-4)
    };
    if (target && target.length) {
        options.target = target.toString();
        if (winstonQty && +winstonQty > 0) {
            options.quantity = winstonQty.toString();
        }
    }
    // both reward and last_tx are irrelevant in case of interactions
    // that are bundled. So to speed up the procees (and prevent the arweave-js
    // from calling /tx_anchor and /price endpoints) - we're presetting theses
    // values here
    if (dummy) {
        options.reward = '72600854';
        options.last_tx = 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO';
    }
    if (reward && reward.length) {
        options.reward = reward;
    }
    const interactionTx = await arweave.createTransaction(options);
    if (!input) {
        throw new Error(`Input should be a truthy value: ${JSON.stringify(input)}`);
    }
    if (tags && tags.length) {
        for (const tag of tags) {
            interactionTx.addTag(tag.name.toString(), tag.value.toString());
        }
    }
    interactionTx.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_NAME, 'SmartWeaveAction');
    // use real SDK version here?
    interactionTx.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_VERSION, '0.3.0');
    interactionTx.addTag(SmartWeaveTags_1.SmartWeaveTags.SDK, 'Warp');
    interactionTx.addTag(SmartWeaveTags_1.SmartWeaveTags.CONTRACT_TX_ID, contractId);
    interactionTx.addTag(SmartWeaveTags_1.SmartWeaveTags.INPUT, JSON.stringify(input));
    if (signer) {
        await signer(interactionTx);
    }
    return interactionTx;
}
exports.createInteractionTx = createInteractionTx;
function createDummyTx(tx, from, block) {
    // transactions loaded from gateway (either arweave.net GQL or Warp) have the tags decoded
    // - so to be consistent, the "dummy" tx, which is used for viewState and dryWrites, also has to have
    // the tags decoded.
    const decodedTags = unpackTags(tx);
    return {
        id: tx.id,
        owner: {
            address: from,
            key: ''
        },
        recipient: tx.target,
        tags: decodedTags,
        fee: {
            winston: tx.reward,
            ar: ''
        },
        quantity: {
            winston: tx.quantity,
            ar: ''
        },
        block: {
            id: block.indep_hash,
            height: block.height,
            timestamp: block.timestamp,
            previous: null
        },
        // note: calls within dry runs cannot be cached (per block - like the state cache)!
        // that's super important, as the block height used for
        // the dry-run is the current network block height
        // - and not the block height of the real transaction that
        // will be mined on Arweave.
        // If we start caching results of the dry-runs, we can completely fuck-up
        // the consecutive state evaluations.
        // - that's why we're setting "dry" flag to true here
        // - this prevents the caching layer from saving
        // the state evaluated for such interaction in cache.
        dry: true,
        anchor: null,
        signature: null,
        data: null,
        parent: null,
        bundledIn: null
    };
}
exports.createDummyTx = createDummyTx;
function unpackTags(tx) {
    const tags = tx.get('tags');
    const result = [];
    for (const tag of tags) {
        try {
            const name = tag.get('name', { decode: true, string: true });
            const value = tag.get('value', { decode: true, string: true });
            result.push({ name, value });
        }
        catch (e) {
            // ignore tags with invalid utf-8 strings in key or value.
        }
    }
    return result;
}
exports.unpackTags = unpackTags;
//# sourceMappingURL=create-interaction-tx.js.map