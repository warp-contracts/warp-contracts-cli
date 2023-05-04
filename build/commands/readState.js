"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContract = exports.readState = void 0;
const chalk_1 = __importDefault(require("chalk"));
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
const readState = async (contractId, cmdOptions, options) => {
    const env = options.environment;
    const silent = options.silent;
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
        const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
        !silent &&
            console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
        let contract;
        contract = (0, exports.getContract)(cmdOptions, warp, contractId, false);
        load = !silent && (0, utils_1.loader)('Loading state...');
        const { cachedValue } = await contract.readState();
        !silent && load.stop();
        let readStateObj = { state: {} };
        if (cmdOptions.save) {
            const saveFile = typeof cmdOptions.save === 'string' ? cmdOptions.save : `state_${contractId}.json`;
            if (!cmdOptions.stateValidity && !cmdOptions.stateErrorMessages) {
                fs_1.default.writeFileSync(saveFile, JSON.stringify(cachedValue.state, null, 2));
            }
            else {
                readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
                fs_1.default.writeFileSync(saveFile, JSON.stringify(readStateObj, null, 2));
            }
            !silent && console.log(`${utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`)} State saved in: ${(0, utils_1.chalkBlue)(saveFile)} file.`);
        }
        else {
            if (!cmdOptions.stateValidity && !cmdOptions.stateErrorMessages) {
                !silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, (0, utils_1.chalkGreen)(`${contractId}:`));
                silent
                    ? process.stdout.write(JSON.stringify(cachedValue.state))
                    : console.dir(cachedValue.state, { depth: null });
            }
            else {
                readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
                !silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, (0, utils_1.chalkGreen)(`${contractId}:`));
                silent ? process.stdout.write(JSON.stringify(readStateObj)) : console.dir(readStateObj, { depth: null });
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
    if (cmdOptions.stateValidity) {
        readStateObj.validity = cachedValue.validity;
    }
    if (cmdOptions.stateErrorMessages) {
        readStateObj.errorMessages = cachedValue.errorMessages;
    }
    return readStateObj;
};
const getContract = (cmdOptions, warp, contractId, connect, wallet) => {
    if (cmdOptions.evaluationOptions) {
        const evaluationOptionsList = cmdOptions.evaluationOptions.filter((option) => ['allowBigInt', 'allowUnsafeClient', 'internalWrites'].includes(option));
        const evaluationOptions = evaluationOptionsList.reduce((o, key) => ({ ...o, [key]: true }), {});
        const contract = warp.contract(contractId).setEvaluationOptions(evaluationOptions);
        connect && contract.connect(wallet);
        return contract;
    }
    else {
        const contract = warp.contract(contractId);
        connect && contract.connect(wallet);
        return contract;
    }
};
exports.getContract = getContract;
//# sourceMappingURL=readState.js.map