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
exports.HandlerExecutorFactory = void 0;
const loader_1 = __importDefault(require("@assemblyscript/loader"));
const as_wasm_imports_1 = require("./wasm/as-wasm-imports");
const rust_wasm_imports_1 = require("./wasm/rust-wasm-imports");
const go_wasm_imports_1 = require("./wasm/go-wasm-imports");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const vm2 = __importStar(require("vm2"));
const smartweave_global_1 = require("../../../legacy/smartweave-global");
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const JsHandlerApi_1 = require("./handler/JsHandlerApi");
const WasmHandlerApi_1 = require("./handler/WasmHandlerApi");
const normalize_source_1 = require("./normalize-source");
const MemCache_1 = require("../../../cache/impl/MemCache");
class ContractError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ContractError';
    }
}
/**
 * A factory that produces handlers that are compatible with the "current" style of
 * writing SW contracts (i.e. using "handle" function).
 */
class HandlerExecutorFactory {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('HandlerExecutorFactory');
        // TODO: cache compiled wasm binaries here.
        this.cache = new MemCache_1.MemCache();
    }
    async create(contractDefinition, evaluationOptions) {
        const swGlobal = new smartweave_global_1.SmartWeaveGlobal(this.arweave, {
            id: contractDefinition.txId,
            owner: contractDefinition.owner
        }, evaluationOptions);
        if (contractDefinition.contractType == 'wasm') {
            this.logger.info('Creating handler for wasm contract', contractDefinition.txId);
            const benchmark = Benchmark_1.Benchmark.measure();
            let wasmInstance;
            let jsExports = null;
            const wasmResponse = generateResponse(contractDefinition.srcBinary);
            switch (contractDefinition.srcWasmLang) {
                case 'assemblyscript': {
                    const wasmInstanceExports = {
                        exports: null
                    };
                    wasmInstance = await loader_1.default.instantiateStreaming(wasmResponse, (0, as_wasm_imports_1.asWasmImports)(swGlobal, wasmInstanceExports));
                    // note: well, exports are required by some imports
                    // - e.g. those that use wasmModule.exports.__newString underneath (like Block.indep_hash)
                    wasmInstanceExports.exports = wasmInstance.exports;
                    break;
                }
                case 'rust': {
                    const wasmInstanceExports = {
                        exports: null,
                        modifiedExports: {
                            wasm_bindgen__convert__closures__invoke2_mut__: null,
                            _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__: null
                        }
                    };
                    /**
                     * wasm-bindgen mangles import function names (adds some random number after "base name")
                     * - that's why we cannot statically build the imports in the SDK.
                     * Instead - we need to first compile the module and check the generated
                     * import function names (all imports from the "__wbindgen_placeholder__" import module).
                     * Having those generated function names - we need to then map them to import functions -
                     * see {@link rustWasmImports}
                     *
                     * That's probably a temporary solution - it would be the best to force the wasm-bindgen
                     * to NOT mangle the import function names - unfortunately that is not currently possible
                     * - https://github.com/rustwasm/wasm-bindgen/issues/1128
                     */
                    const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
                    const moduleImports = WebAssembly.Module.imports(wasmModule);
                    const wbindgenImports = moduleImports
                        .filter((imp) => {
                        return imp.module === '__wbindgen_placeholder__';
                    })
                        .map((imp) => imp.name);
                    const { imports, exports } = (0, rust_wasm_imports_1.rustWasmImports)(swGlobal, wbindgenImports, wasmInstanceExports, contractDefinition.metadata.dtor);
                    jsExports = exports;
                    wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
                    wasmInstanceExports.exports = wasmInstance.exports;
                    const moduleExports = Object.keys(wasmInstance.exports);
                    // ... no comments ...
                    moduleExports.forEach((moduleExport) => {
                        if (moduleExport.startsWith('wasm_bindgen__convert__closures__invoke2_mut__')) {
                            wasmInstanceExports.modifiedExports.wasm_bindgen__convert__closures__invoke2_mut__ =
                                wasmInstance.exports[moduleExport];
                        }
                        if (moduleExport.startsWith('_dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__')) {
                            wasmInstanceExports.modifiedExports._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ =
                                wasmInstance.exports[moduleExport];
                        }
                    });
                    break;
                }
                case 'go': {
                    const go = new go_wasm_imports_1.Go(swGlobal);
                    go.importObject.metering = {
                        usegas: function (value) {
                            swGlobal.useGas(value);
                        }
                    };
                    const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
                    wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);
                    // nope - DO NOT await here!
                    go.run(wasmInstance);
                    jsExports = go.exports;
                    break;
                }
                default: {
                    throw new Error(`Support for ${contractDefinition.srcWasmLang} not implemented yet.`);
                }
            }
            this.logger.info(`WASM ${contractDefinition.srcWasmLang} handler created in ${benchmark.elapsed()}`);
            return new WasmHandlerApi_1.WasmHandlerApi(swGlobal, contractDefinition, jsExports || wasmInstance.exports);
        }
        else {
            this.logger.info('Creating handler for js contract', contractDefinition.txId);
            const normalizedSource = (0, normalize_source_1.normalizeContractSource)(contractDefinition.src, evaluationOptions.useVM2);
            if (!evaluationOptions.allowUnsafeClient) {
                if (normalizedSource.includes('SmartWeave.unsafeClient')) {
                    throw new Error('Using unsafeClient is not allowed by default. Use EvaluationOptions.allowUnsafeClient flag.');
                }
            }
            if (!evaluationOptions.allowBigInt) {
                if (normalizedSource.includes('BigInt')) {
                    throw new Error('Using BigInt is not allowed by default. Use EvaluationOptions.allowBigInt flag.');
                }
            }
            if (evaluationOptions.useVM2) {
                const vmScript = new vm2.VMScript(normalizedSource);
                const vm = new vm2.NodeVM({
                    console: 'off',
                    sandbox: {
                        SmartWeave: swGlobal,
                        BigNumber: bignumber_js_1.default,
                        logger: this.logger,
                        ContractError: ContractError,
                        ContractAssert: function (cond, message) {
                            if (!cond)
                                throw new ContractError(message);
                        }
                    },
                    compiler: 'javascript',
                    eval: false,
                    wasm: false,
                    allowAsync: true,
                    wrapper: 'commonjs'
                });
                return new JsHandlerApi_1.JsHandlerApi(swGlobal, contractDefinition, vm.run(vmScript));
            }
            else {
                const contractFunction = new Function(normalizedSource);
                const handler = contractFunction(swGlobal, bignumber_js_1.default, LoggerFactory_1.LoggerFactory.INST.create(swGlobal.contract.id));
                return new JsHandlerApi_1.JsHandlerApi(swGlobal, contractDefinition, handler);
            }
        }
    }
}
exports.HandlerExecutorFactory = HandlerExecutorFactory;
function generateResponse(wasmBinary) {
    const init = { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/wasm' } };
    return new Response(wasmBinary, init);
}
async function getWasmModule(wasmResponse, binary) {
    if (WebAssembly.compileStreaming) {
        return await WebAssembly.compileStreaming(wasmResponse);
    }
    else {
        return await WebAssembly.compile(binary);
    }
}
//# sourceMappingURL=HandlerExecutorFactory.js.map