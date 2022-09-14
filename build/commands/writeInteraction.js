"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeInteraction = void 0;
const warp_contracts_1 = require("warp-contracts");
const utils_1 = require("../utils/utils");
const chalk_1 = __importDefault(require("chalk"));
const writeInteraction = async (contractId, interaction, cmdOptions, options) => {
    // let load: any;
    try {
        warp_contracts_1.LoggerFactory.INST.logLevel(options.level || 'error');
        const warp = (0, utils_1.getWarp)(options.environment);
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${options.environment}`), 'environment.');
        const [wallet] = await (0, utils_1.loadWallet)(warp, options.environment, options.wallet);
        const contract = warp.contract(contractId).connect(wallet);
        // load = loader('Writing interaction...');
        console.log(JSON.parse(interaction));
        const result = await contract.writeInteraction(JSON.parse(interaction), cmdOptions.strict && { strict: true });
        // load.stop();
        console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Interaction written correctly. Interaction:`);
        console.dir(result);
        console.log(`${options.environment == 'mainnet' || options.environment == 'testnet'
            ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${result.originalTxId}${options.environment == 'testnet' ? '?network=testnet' : ''}`}`
            : ''}`);
    }
    catch (err) {
        // load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while writing interaction: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.writeInteraction = writeInteraction;
//# sourceMappingURL=writeInteraction.js.map