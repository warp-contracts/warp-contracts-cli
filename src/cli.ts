#!/usr/bin/env node
import { Command } from 'commander';
import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';
import { deployContract } from './commands/deployContract';
import { readState } from './commands/readState';
import { writeInteraction } from './commands/writeInteraction';
import { chalkBlue, getPackageJson, printWarningAboutNodeJsVersionIfNecessary } from './utils/utils';
import { clearCache } from './commands/clearCache';
import { execSync } from 'child_process';
import { viewState } from './commands/viewState';

(async () => {
  const program = new Command();
  clear();

  const packageJson = await getPackageJson();
  printWarningAboutNodeJsVersionIfNecessary(packageJson);

  console.log(
    chalkBlue(
      figlet.textSync('WARP-CLI', {
        horizontalLayout: 'full',
        font: 'Slant'
      })
    )
  );

  console.log(chalkBlue(`\n👾Welcome to Warp Contracts CLI v.${packageJson.version} 👾\n`));

  program
    .option('-wlt, --wallet <string>', 'Path to the keyfile')
    .requiredOption('-env --environment <string>', 'Envrionment in which action needs to be executed')
    .option('-lvl --level <string>', 'Logging level: silly | trace | debug | info | warn | error | fatal', 'error')
    .option('--debug, -d', 'Increases verbosity of errors and logs additional debug information.')
    .version(
      execSync('npm view warp-contracts version').toString().replace('\n', ''),
      '-v, --version',
      'Displays current version of Warp SDK'
    );

  program
    .command('deploy')
    .description('Deploy contract')
    .argument('<state>', 'relative path to the initial state file')
    .option('-sf --sourceFile <string>', 'relative path to the contract src file')
    .option('-st --sourceTxId <string>', 'id of the source transaction')
    .option('-ws --wasmSrc <string>', 'relative path to WASM contract, e.g. `src`')
    .option(
      '-wg --wasmGlueCode <string>',
      'relative path to WASM glue code (only for Rust contracts), e.g. `../pkg/erc20-contract.js`'
    )
    .action((state, cmdOptions) => {
      deployContract(state, cmdOptions, options);
    });

  program
    .command('read')
    .description('Read contract state based on contract id')
    .argument('<contractId>', 'id of the contract')
    .option('-sv --save <string>', 'Saves state to a file')
    .action((contractId, cmdOptions) => {
      readState(contractId, cmdOptions, options);
    });

  program
    .command('write')
    .description('Write interaction to the contract based on specified contract id')
    .argument('<contractId>', 'id of the contract')
    .argument('<interaction>', 'interaction object passed to the writeInteraction method')
    .option('-str --strict <string>', 'if true strict mode is enabled', false)
    .action((contractId, interaction, cmdOptions) => {
      writeInteraction(contractId, interaction, cmdOptions, options);
    });

  program
    .command('view')
    .description('View state of the contract based on specified contract id and provided input')
    .argument('<contractId>', 'id of the contract')
    .argument('<input>', 'input object passed to the viewState method')
    .action((contractId, interaction, cmdOptions) => {
      viewState(contractId, interaction, cmdOptions, options);
    });

  program
    .command('clear')
    .description('Clears cache')
    .action(() => {
      clearCache(options);
    });

  const options = program.opts();
  if (options.debug) console.log(options);
  program.parse(process.argv);
})();
