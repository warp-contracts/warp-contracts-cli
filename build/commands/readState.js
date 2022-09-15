"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readState = void 0;
const chalk_1 = __importDefault(require("chalk"));
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
const readState = async (contractId, cmdOptions, options) => {
    if (!options.environment) {
        console.log(chalk_1.default.red(`💣 [ERROR]:`), `-env --environment option must be specified.`);
        return;
    }
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level || 'error');
        const warp = (0, utils_1.getWarp)(options.environment);
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${options.environment}`), 'environment.');
        const contract = warp.contract(contractId);
        load = (0, utils_1.loader)('Loading state...');
        const { cachedValue } = await contract.readState();
        load.stop();
        console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, (0, utils_1.chalkGreen)(`${contractId}:`));
        console.dir(cachedValue.state);
        if (cmdOptions.save) {
            fs_1.default.writeFileSync(`state_${contractId}.json`, JSON.stringify(cachedValue.state, null, 2));
            console.log(`${utils_1.chalkBlue.bold(`👽 [INFO]:`)} State saved in: ${(0, utils_1.chalkBlue)(`state_${contractId}.json`)} file.`);
        }
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while reading contract state: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.readState = readState;
//# sourceMappingURL=readState.js.map