"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewState = void 0;
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const chalk_1 = __importDefault(require("chalk"));
const viewState = async (contractId, interaction, cmdOptions, options) => {
    if (!options.environment) {
        console.log(chalk_1.default.red(`💣 [ERROR]:`), `-env --environment option must be specified.`);
        return;
    }
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level || 'error');
        const warp = (0, utils_1.getWarp)(options.environment);
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${options.environment}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, options.environment, options.wallet);
        const contract = warp.contract(contractId).connect(wallet);
        load = (0, utils_1.loader)('Viewing state...');
        console.log(JSON.parse(interaction));
        const result = await contract.viewState(JSON.parse(interaction));
        load.stop();
        console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
        console.dir(result);
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while viewing state: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.viewState = viewState;
//# sourceMappingURL=viewState.js.map