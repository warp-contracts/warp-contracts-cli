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
    const env = options.environment;
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
        const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, env, options.wallet);
        const contract = warp.contract(contractId).connect(wallet);
        load = (0, utils_1.loader)('Viewing state...');
        const result = await contract.viewState(JSON.parse(interaction));
        load.stop();
        if (result.type == 'error') {
            console.log(chalk_1.default.red.bold(`💣 [ERROR]:`), `View state executed incorrectly. Error message:`);
            console.dir(result.errorMessage);
        }
        else {
            console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
            console.dir(result.result);
        }
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while viewing state: ${err.message} `);
        return;
    }
};
exports.viewState = viewState;
//# sourceMappingURL=viewState.js.map