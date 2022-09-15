"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContract = void 0;
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const warp_contracts_1 = require("warp-contracts");
const chalk_1 = __importDefault(require("chalk"));
const deploy_1 = require("../utils/deploy");
const deployContract = async (options) => {
    const env = options.environment;
    let load;
    try {
        await (0, deploy_1.deployPrompt)(deployFunc, options, env, load);
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${err.message} `);
        return;
    }
};
exports.deployContract = deployContract;
const deployFunc = async (options, env, state, sourceFile, sourceTxId, wasmSrc, wasmGlueCode, load) => {
    warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
    console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
    const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
    const [wallet] = await (0, utils_1.loadWallet)(warp, env, options.wallet);
    const initialState = fs_1.default.readFileSync(path_1.default.resolve(state), 'utf8');
    let contractSrc = null;
    let deployment;
    load = (0, utils_1.loader)('Deploying contract...');
    if (sourceFile) {
        contractSrc = wasmSrc
            ? fs_1.default.readFileSync(path_1.default.resolve(sourceFile))
            : fs_1.default.readFileSync(path_1.default.resolve(sourceFile), 'utf8');
        deployment = await warp.createContract.deploy({
            wallet,
            initState: JSON.stringify(initialState),
            src: contractSrc,
            ...(wasmSrc && { wasmSrcCodeDir: path_1.default.resolve(wasmSrc) }),
            ...(wasmGlueCode && { wasmGlueCode: path_1.default.resolve(wasmGlueCode) })
        });
    }
    if (sourceTxId) {
        deployment = await warp.createContract.deployFromSourceTx({
            wallet,
            initState: JSON.stringify(initialState),
            srcTxId: sourceTxId
        });
    }
    load.stop();
    console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Contract deployed correctly. Contract:`);
    console.dir(deployment);
    console.log(`${env == 'mainnet' || env == 'testnet'
        ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${deployment.contractTxId}${env == 'testnet' ? '?network=testnet' : ''}`}`
        : ''}`);
};
//# sourceMappingURL=deployContract.js.map