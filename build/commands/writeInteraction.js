"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeInteraction = void 0;
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const chalk_1 = __importDefault(require("chalk"));
const readState_1 = require("./readState");
const writeInteraction = async (contractId, interaction, cmdOptions, options) => {
    const env = options.environment;
    const silent = options.silent;
    let load;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
        const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
        !silent &&
            console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, env, options);
        let contract;
        contract = (0, readState_1.getContract)(cmdOptions, warp, contractId, true, wallet);
        load = !silent && (0, utils_1.loader)('Writing interaction...');
        const result = await contract.writeInteraction(JSON.parse(interaction), cmdOptions.strict && { strict: true });
        !silent && load.stop();
        !silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Interaction written correctly. Interaction:`);
        silent ? process.stdout.write(JSON.stringify(result)) : console.dir(result);
        !silent &&
            console.log(`${env == 'mainnet' || env == 'testnet'
                ? `View interaction in SonAr: ${`https://sonar.warp.cc/#/app/contract/${result.originalTxId}${env == 'testnet' ? '?network=testnet' : ''}`}`
                : ''}`);
    }
    catch (err) {
        load && !silent && load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while writing interaction: ${err.message} `);
        return;
    }
};
exports.writeInteraction = writeInteraction;
//# sourceMappingURL=writeInteraction.js.map