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
        .option('-wlt, --wallet <string>', 'Path to the keyfile')
        .option('-env --environment <string>', 'Envrionment in which action needs to be executed')
        .option('-lvl --level <string>', 'Logging level: silly | trace | debug | info | warn | error | fatal', 'error')
        .option('--debug, -d', 'Increases verbosity of errors and logs additional debug information.')
        .version((0, child_process_1.execSync)('npm view warp-contracts version').toString().replace('\n', ''), '-v, --version', 'Displays current version of Warp SDK');
    program
        .command('deploy')
        .description('Deploy contract')
        .argument('<state>', 'relative path to the initial state file')
        .option('-sf --sourceFile <string>', 'relative path to the contract src file')
        .option('-st --sourceTxId <string>', 'id of the source transaction')
        .option('-ws --wasmSrc <string>', 'relative path to WASM contract, e.g. `src`')
        .option('-wg --wasmGlueCode <string>', 'relative path to WASM glue code (only for Rust contracts), e.g. `../pkg/erc20-contract.js`')
        .action((state, cmdOptions) => {
        (0, deployContract_1.deployContract)(state, cmdOptions, options);
    });
    program
        .command('read')
        .description('Read contract state based on contract id')
        .argument('<contractId>', 'id of the contract')
        .option('-sv --save <string>', 'Saves state to a file')
        .action((contractId, cmdOptions) => {
        (0, readState_1.readState)(contractId, cmdOptions, options);
    });
    program
        .command('write')
        .description('Write interaction to the contract based on specified contract id')
        .argument('<contractId>', 'id of the contract')
        .argument('<interaction>', 'interaction object passed to the writeInteraction method')
        .option('-str --strict <string>', 'if true strict mode is enabled', false)
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