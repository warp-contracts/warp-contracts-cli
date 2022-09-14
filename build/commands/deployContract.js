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
const deployContract = async (state, cmdOptions, options) => {
    if (!cmdOptions.sourceFile && !cmdOptions.sourceTxId) {
        console.log(chalk_1.default.red(`💣 [ERROR]:`), `Either source transaction id or source file must be specified.`);
        return;
    }
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level || 'error');
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${options.environment}`), 'environment.');
        const warp = (0, utils_1.getWarp)(options.environment);
        const [wallet] = await (0, utils_1.loadWallet)(warp, options.environment, options.wallet);
        const initialState = fs_1.default.readFileSync(path_1.default.resolve(state), 'utf8');
        let contractSrc = null;
        let deployment;
        load = (0, utils_1.loader)('Deploying contract...');
        if (cmdOptions.sourceFile) {
            contractSrc = fs_1.default.readFileSync(path_1.default.resolve(cmdOptions.sourceFile), 'utf8');
            deployment = await warp.createContract.deploy({
                wallet,
                initState: JSON.stringify(initialState),
                src: contractSrc,
                ...(cmdOptions.wasmSrc && { wasmSrcCodeDir: path_1.default.resolve(cmdOptions.wasmSrc) }),
                ...(cmdOptions.wasmGlueCode && { wasmGlueCode: path_1.default.resolve(cmdOptions.wasmGlueCode) })
            });
        }
        if (cmdOptions.sourceTxId) {
            deployment = await warp.createContract.deployFromSourceTx({
                wallet,
                initState: JSON.stringify(initialState),
                srcTxId: cmdOptions.sourceTxId
            });
        }
        load.stop();
        console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Contract deployed correctly. Contract:`);
        console.dir(deployment);
        console.log(`${options.environment == 'mainnet' || options.environment == 'testnet'
            ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${deployment.contractTxId}${options.environment == 'testnet' ? '?network=testnet' : ''}`}`
            : ''}`);
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.deployContract = deployContract;
//# sourceMappingURL=deployContract.js.map