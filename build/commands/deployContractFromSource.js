"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContractFromSource = void 0;
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const warp_contracts_1 = require("warp-contracts");
const chalk_1 = __importDefault(require("chalk"));
const deployContractFromSource = async (srcTxId, state, walletPath, options) => {
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level || 'error');
        const warp = (0, utils_1.getWarp)(options.environment);
        console.log(utils_1.chalkBlue.bold(`🚀 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${options.environment}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, options.environment, walletPath);
        const initialState = fs_1.default.readFileSync(path_1.default.resolve(state), 'utf8');
        const deployment = await warp.createContract.deployFromSourceTx({
            wallet,
            initState: JSON.stringify(initialState),
            srcTxId
        });
        console.log(utils_1.chalkBlue.bold(`🚀 INFO:`), `Contract deployed correctly. Contract tx id:`, utils_1.chalkBlue.bold(`${deployment.contractTxId}.`));
    }
    catch (err) {
        console.log(chalk_1.default.red(err));
        console.error(chalk_1.default.red(`💣 ERROR:`), `Error while deploying contract: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.deployContractFromSource = deployContractFromSource;
//# sourceMappingURL=deployContractFromSource.js.map