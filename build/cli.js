#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const clear_1 = __importDefault(require("clear"));
const figlet_1 = __importDefault(require("figlet"));
const deployContract_1 = require("./commands/deployContract");
const readState_1 = require("./commands/readState");
const writeInteraction_1 = require("./commands/writeInteraction");
const utils_1 = require("./utils/utils");
const clearCache_1 = require("./commands/clearCache");
const child_process_1 = require("child_process");
const viewState_1 = require("./commands/viewState");
(async () => {
    const program = new commander_1.Command();
    (0, clear_1.default)();
    const packageJson = await (0, utils_1.getPackageJson)();
    (0, utils_1.printWarningAboutNodeJsVersionIfNecessary)(packageJson);
    console.log((0, utils_1.chalkBlue)(figlet_1.default.textSync('WARP', {
        horizontalLayout: 'full',
        font: 'Speed'
    })));
    console.log((0, utils_1.chalkBlue)(`👾👾👾 Welcome to Warp Contracts CLI v.${packageJson.version} 👾👾👾\n`));
    program
        .option('-wlt, --wallet <string>', 'Path to the wallet keyfile (e.g.: ./secrets/wallet.json)')
        .option('-env --environment <string>', 'Envrionment in which action needs to be executed: local | testnet | mainnet', 'mainnet')
        .option('-lvl --level <string>', 'Logging level: silly | trace | debug | info | warn | error | fatal | none', 'none')
        .option('-c --cacheLocation <string>', 'Realtive path to the Level database location', '/cache/warp')
        .version((0, child_process_1.execSync)('npm view warp-contracts version').toString().replace('\n', ''), '-v, --version', 'Display current version of Warp SDK');
    program
        .command('deploy')
        .description('Deploy contract')
        .action(() => {
        (0, deployContract_1.deployContract)(options);
    });
    program
        .command('read')
        .description('Read contract state based on contract id')
        .argument('<contractId>', 'id of the contract')
        .option('-sv --save [string]', 'Save state to a file, optionally name of the target file can be specified (e.g.: state.json)')
        .option('-eo --evaluationOptions <options...>', 'Specify evaluation options: allowBigInt | allowUnsafeClient | internalWrites')
        .option('-stval --stateValidity', 'Beside the state object, return validity object')
        .option('-sterr --stateErrorMessages', 'Beside the state object, return errorMessages object')
        .action((contractId, cmdOptions) => {
        (0, readState_1.readState)(contractId, cmdOptions, options);
    });
    program
        .command('write')
        .description('Write interaction to the contract based on specified contract id')
        .argument('<contractId>', 'id of the contract')
        .argument('<interaction>', 'interaction object passed to the writeInteraction method')
        .option('-str --strict', 'when set - methods evaluate the state and lets verify wether transaction has been processed correctly', false)
        .option('-eo --evaluationOptions <options...>', 'Specify evaluation options: allowBigInt | allowUnsafeClient | internalWrites')
        .action((contractId, interaction, cmdOptions) => {
        (0, writeInteraction_1.writeInteraction)(contractId, interaction, cmdOptions, options);
    });
    program
        .command('view')
        .description('View state of the contract based on specified contract id and provided input')
        .argument('<contractId>', 'id of the contract')
        .argument('<input>', 'input object passed to the viewState method')
        .action((contractId, interaction, cmdOptions) => {
        (0, viewState_1.viewState)(contractId, interaction, cmdOptions, options);
    });
    program
        .command('clear')
        .description('Clears cache')
        .action(() => {
        (0, clearCache_1.clearCache)(options);
    });
    const options = program.opts();
    if (options.debug)
        console.log(options);
    program.parse(process.argv);
})();
//# sourceMappingURL=cli.js.map