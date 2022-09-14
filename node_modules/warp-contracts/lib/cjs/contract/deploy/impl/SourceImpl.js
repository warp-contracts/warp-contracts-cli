"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceImpl = void 0;
/* eslint-disable */
const redstone_wasm_metering_1 = __importDefault(require("redstone-wasm-metering"));
const go_wasm_imports_1 = require("../../../core/modules/impl/wasm/go-wasm-imports");
const fs_1 = __importDefault(require("fs"));
const wasm_bindgen_tools_1 = require("../../../core/modules/impl/wasm/wasm-bindgen-tools");
const SmartWeaveTags_1 = require("../../../core/SmartWeaveTags");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const wasmTypeMapping = new Map([
    [1, 'assemblyscript'],
    [2, 'rust'],
    [3, 'go']
    /*[4, 'swift'],
    [5, 'c']*/
]);
class SourceImpl {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('Source');
    }
    async save(contractData, signer, useBundler = false) {
        this.logger.debug('Creating new contract source');
        const { src, wasmSrcCodeDir, wasmGlueCode } = contractData;
        const contractType = src instanceof Buffer ? 'wasm' : 'js';
        let srcTx;
        let wasmLang = null;
        let wasmVersion = null;
        const metadata = {};
        const data = [];
        if (contractType == 'wasm') {
            const meteredWasmBinary = redstone_wasm_metering_1.default.meterWASM(src, {
                meterType: 'i32'
            });
            data.push(meteredWasmBinary);
            const wasmModule = await WebAssembly.compile(src);
            const moduleImports = WebAssembly.Module.imports(wasmModule);
            let lang;
            if (this.isGoModule(moduleImports)) {
                const go = new go_wasm_imports_1.Go(null);
                const module = new WebAssembly.Instance(wasmModule, go.importObject);
                // DO NOT await here!
                go.run(module);
                lang = go.exports.lang();
                wasmVersion = go.exports.version();
            }
            else {
                const module = await WebAssembly.instantiate(src, dummyImports(moduleImports));
                // @ts-ignore
                if (!module.instance.exports.lang) {
                    throw new Error(`No info about source type in wasm binary. Did you forget to export "lang" function?`);
                }
                // @ts-ignore
                lang = module.instance.exports.lang();
                // @ts-ignore
                wasmVersion = module.instance.exports.version();
                if (!wasmTypeMapping.has(lang)) {
                    throw new Error(`Unknown wasm source type ${lang}`);
                }
            }
            wasmLang = wasmTypeMapping.get(lang);
            if (wasmSrcCodeDir == null) {
                throw new Error('No path to original wasm contract source code');
            }
            const zippedSourceCode = await this.zipContents(wasmSrcCodeDir);
            data.push(zippedSourceCode);
            if (wasmLang == 'rust') {
                if (!wasmGlueCode) {
                    throw new Error('No path to generated wasm-bindgen js code');
                }
                const wasmBindgenSrc = fs_1.default.readFileSync(wasmGlueCode, 'utf-8');
                const dtor = (0, wasm_bindgen_tools_1.matchMutClosureDtor)(wasmBindgenSrc);
                metadata['dtor'] = parseInt(dtor);
                data.push(Buffer.from(wasmBindgenSrc));
            }
        }
        const allData = contractType == 'wasm' ? this.joinBuffers(data) : src;
        if (typeof signer == 'function') {
            srcTx = await this.arweave.createTransaction({ data: allData });
        }
        else {
            srcTx = await this.arweave.createTransaction({ data: allData }, signer);
        }
        srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_NAME, 'SmartWeaveContractSource');
        // TODO: version should be taken from the current package.json version.
        srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.APP_VERSION, '0.3.0');
        srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.SDK, 'Warp');
        srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.CONTENT_TYPE, contractType == 'js' ? 'application/javascript' : 'application/wasm');
        if (contractType == 'wasm') {
            srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.WASM_LANG, wasmLang);
            srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.WASM_LANG_VERSION, wasmVersion);
            srcTx.addTag(SmartWeaveTags_1.SmartWeaveTags.WASM_META, JSON.stringify(metadata));
        }
        if (typeof signer == 'function') {
            await signer(srcTx);
        }
        else {
            await this.arweave.transactions.sign(srcTx, signer);
        }
        this.logger.debug('Posting transaction with source');
        // note: in case of useBundler = true, we're posting both
        // src tx and contract tx in one request.
        let responseOk = true;
        let response;
        if (!useBundler) {
            response = await this.arweave.transactions.post(srcTx);
            responseOk = response.status === 200 || response.status === 208;
        }
        if (responseOk) {
            return srcTx;
        }
        else {
            throw new Error(`Unable to write Contract Source. Arweave responded with status ${response.status}: ${response.statusText}`);
        }
    }
    isGoModule(moduleImports) {
        return moduleImports.some((moduleImport) => {
            return moduleImport.module == 'env' && moduleImport.name.startsWith('syscall/js');
        });
    }
    joinBuffers(buffers) {
        const length = buffers.length;
        const result = [];
        result.push(Buffer.from(length.toString()));
        result.push(Buffer.from('|'));
        buffers.forEach((b) => {
            result.push(Buffer.from(b.length.toString()));
            result.push(Buffer.from('|'));
        });
        result.push(...buffers);
        return result.reduce((prev, b) => Buffer.concat([prev, b]));
    }
    async zipContents(source) {
        const archiver = require('archiver'), streamBuffers = require('stream-buffers');
        const outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
            initialSize: 1000 * 1024,
            incrementAmount: 1000 * 1024 // grow by 1000 kilobytes each time buffer overflows.
        });
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(outputStreamBuffer);
        archive.directory(source.toString(), source.toString());
        await archive.finalize();
        outputStreamBuffer.end();
        return outputStreamBuffer.getContents();
    }
}
exports.SourceImpl = SourceImpl;
function dummyImports(moduleImports) {
    const imports = {};
    moduleImports.forEach((moduleImport) => {
        if (!Object.prototype.hasOwnProperty.call(imports, moduleImport.module)) {
            imports[moduleImport.module] = {};
        }
        imports[moduleImport.module][moduleImport.name] = function () { };
    });
    return imports;
}
//# sourceMappingURL=SourceImpl.js.map