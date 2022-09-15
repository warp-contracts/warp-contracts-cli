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
    const env = options.environment;
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
        const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
        let contract;
        if (cmdOptions.evaluationOptions) {
            const evaluationOptionsList = cmdOptions.evaluationOptions.filter((option) => ['allowBigInt', 'allowUnsafeClient', 'internalWrites'].includes(option));
            const evaluationOptions = evaluationOptionsList.reduce((o, key) => ({ ...o, [key]: true }), {});
            contract = warp.contract(contractId).setEvaluationOptions(evaluationOptions);
        }
        else {
            contract = warp.contract(contractId);
        }
        load = (0, utils_1.loader)('Loading state...');
        const { cachedValue } = await contract.readState();
        load.stop();
        let readStateObj = { state: {} };
        if (cmdOptions.save) {
            const saveFile = typeof cmdOptions.save === 'string' ? cmdOptions.save : `state_${contractId}.json`;
            if (!cmdOptions.validity && !cmdOptions.errorMessages) {
                fs_1.default.writeFileSync(saveFile, JSON.stringify(cachedValue.state, null, 2));
            }
            else {
                readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
                fs_1.default.writeFileSync(saveFile, JSON.stringify(readStateObj, null, 2));
            }
            console.log(`${utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`)} State saved in: ${(0, utils_1.chalkBlue)(saveFile)} file.`);
        }
        else {
            if (!cmdOptions.validity && !cmdOptions.errorMessages) {
                console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, (0, utils_1.chalkGreen)(`${contractId}:`));
                console.dir(cachedValue.state);
            }
            else {
                readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
                console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, (0, utils_1.chalkGreen)(`${contractId}:`));
                console.dir(readStateObj);
            }
        }
    }
    catch (err) {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while reading contract state: ${err.message} `);
        return;
    }
};
exports.readState = readState;
const getStateObj = (readStateObj, cachedValue, cmdOptions) => {
    readStateObj.state = cachedValue.state;
    if (cmdOptions.validity) {
        readStateObj.validity = cachedValue.validity;
    }
    if (cmdOptions.errorMessages) {
        readStateObj.errorMessages = cachedValue.errorMessages;
    }
    return readStateObj;
};
//# sourceMappingURL=readState.js.map