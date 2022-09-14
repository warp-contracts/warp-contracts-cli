"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCreateContract = void 0;
const SmartWeaveTags_1 = require("../../../core/SmartWeaveTags");
const WarpFactory_1 = require("../../../core/WarpFactory");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const SourceImpl_1 = require("./SourceImpl");
class DefaultCreateContract {
    constructor(arweave, warp) {
        this.arweave = arweave;
        this.warp = warp;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('DefaultCreateContract');
        this.deployFromSourceTx = this.deployFromSourceTx.bind(this);
    }
    async deploy(contractData, disableBundling) {
        const { wallet, initState, tags, transfer, data } = contractData;
        const effectiveUseBundler = disableBundling == undefined ? this.warp.definitionLoader.type() == 'warp' : !disableBundling;
        const source = new SourceImpl_1.SourceImpl(this.arweave);
        const srcTx = await source.save(contractData, wallet, effectiveUseBundler);
        this.logger.debug('Creating new contract');
        return await this.deployFromSourceTx({
            srcTxId: srcTx.id,
            wallet,
            initState,
            tags,
            transfer,
            data
        }, !effectiveUseBundler, srcTx);
    }
    async deployFromSourceTx(contractData, disableBundling, srcTx = null) {
        this.logger.debug('Creating new contract from src tx');
        const { wallet, srcTxId, initState, tags, transfer, data } = contractData;
        const effectiveUseBundler = disableBundling == undefined ? this.warp.definitionLoader.type() == 'warp' : !disableBundling;
        let contractTX = await this.arweave.createTransaction({ data: (data === null || data === void 0 ? void 0 : data.body) || initState }, wallet);
        if (+(transfer === null || transfer === void 0 ? void 0 : transfer.winstonQty) > 0 && transfer.target.length) {
            this.logger.debug('Creating additional transaction with AR transfer', transfer);
            contractTX = await this.arweave.createTransaction({
                data: (data === null || data === void 0 ? void 0 : data.body) || initState,
                target: transfer.target,
                quantity: transfer.winstonQty
            }, wallet);
        }
        if (tags === null || tags === void 0 ? void 0 : tags.length) {
            for (const tag of tags) {
                contractTX.addTag(tag.name.toString(), tag.value.toString());
            }
        }
        contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_NAME, 'SmartWeaveContract');
        contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_VERSION, '0.3.0');
        contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.CONTRACT_SRC_TX_ID, srcTxId);
        contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.SDK, 'RedStone');
        if (data) {
            contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.CONTENT_TYPE, data['Content-Type']);
            contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.INIT_STATE, initState);
        }
        else {
            contractTX.addTag(SmartWeaveTags_1.SmartWeaveTags.CONTENT_TYPE, 'application/json');
        }
        await this.arweave.transactions.sign(contractTX, wallet);
        let responseOk;
        let response;
        if (effectiveUseBundler) {
            const result = await this.post(contractTX, srcTx);
            this.logger.debug(result);
            responseOk = true;
        }
        else {
            response = await this.arweave.transactions.post(contractTX);
            responseOk = response.status === 200 || response.status === 208;
        }
        if (responseOk) {
            return { contractTxId: contractTX.id, srcTxId };
        }
        else {
            throw new Error(`Unable to write Contract. Arweave responded with status ${response.status}: ${response.statusText}`);
        }
    }
    async post(contractTx, srcTx = null) {
        let body = {
            contractTx
        };
        if (srcTx) {
            body = {
                ...body,
                srcTx
            };
        }
        const response = await fetch(`${WarpFactory_1.WARP_GW_URL}/gateway/contracts/deploy`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error(`Error while posting contract. Sequencer responded with status ${response.status} ${response.statusText}`);
        }
    }
}
exports.DefaultCreateContract = DefaultCreateContract;
//# sourceMappingURL=DefaultCreateContract.js.map