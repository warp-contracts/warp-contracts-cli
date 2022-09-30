"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewState = void 0;
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const chalk_1 = __importDefault(require("chalk"));
const readState_1 = require("./readState");
const viewState = async (contractId, interaction, cmdOptions, options) => {
    const { environment, level, cacheLocation, silent } = options;
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(level);
        const warp = (0, utils_1.getWarp)(environment, cacheLocation);
        !silent &&
            console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${environment}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, environment, options);
        const contract = (0, readState_1.getContract)(cmdOptions, warp, contractId, true, wallet);
        load = !silent && (0, utils_1.loader)('Viewing state...');
        const result = await contract.viewState(JSON.parse(interaction));
        !silent && load.stop();
        if (result.type == 'error') {
            console.log(chalk_1.default.red.bold(`💣 [ERROR]:`), `View state executed incorrectly. Error message:`);
            silent ? process.stdout.write(result.errorMessage) : console.dir(result.errorMessage);
        }
        else {
            !silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
            silent ? process.stdout.write(JSON.stringify(result.result)) : console.dir(result.result);
        }
    }
    catch (err) {
        load && !silent && load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while viewing state: ${err.message} `);
        return;
    }
};
exports.viewState = viewState;
//# sourceMappingURL=viewState.js.map