#!/usr/bin/env node
import { Command } from 'commander';
import { deployContract } from './commands/deployContract';
import { readState } from './commands/readState';
import { writeInteraction } from './commands/writeInteraction';
import { printInfo } from './utils/utils';
import { clearCache } from './commands/clearCache';
import { execSync } from 'child_process';
import { viewState } from './commands/viewState';
import { generate } from './commands/generate';

(async () => {
  const program = new Command();
  program
    .option('-wlt, --wallet <string>', 'Path to the wallet keyfile (e.g.: ./secrets/wallet.json)')
    .option(
      '-env --environment <string>',
      'Envrionment in which action needs to be executed: local | testnet | mainnet',
      'mainnet'
    )
    .option(
      '-lvl --level <string>',
      'Logging level: silly | trace | debug | info | warn | error | fatal | none',
      'none'
    )
    .option('-c --cacheLocation <string>', 'Realtive path for the Level database location', '/cache/warp')
    .option(
      '-sil --silent',
      'Run CLI in silent mode (no logo, only error messages displayed, logged result not formatted)'
    )
    .version(
      execSync('npm view warp-contracts version').toString().replace('\n', ''),
      '-v, --version',
      'Display current version of Warp SDK'
    );
  const options = program.opts();

  program
    .command('generate')
    .description('Generate project template')
    .action(async () => {
      if (options.silent !== true) {
        await printInfo();
      }
      generate(options);
    });

  program
    .command('deploy')
    .description('Deploy contract')
    .action(async () => {
      if (options.silent !== true) {
        await printInfo();
      }
      deployContract(options);
    });

  program
    .command('read')
    .description('Read contract state based on contract id')
    .argument('<contractId>', 'id of the contract')
    .option(
      '-sv --save [string]',
      'Save state to a file, optionally name of the target file can be specified (e.g.: state.json)'
    )
    .option(
      '-eo --evaluationOptions <options...>',
      'Specify evaluation options: allowBigInt | allowUnsafeClient | internalWrites'
    )
    .option('-stval --stateValidity', 'Beside the state object, return validity object')
    .option('-sterr --stateErrorMessages', 'Beside the state object, return errorMessages object')
    .action(async (contractId, cmdOptions) => {
      if (options.silent !== true) {
        await printInfo();
      }
      readState(contractId, cmdOptions, options);
    });

  program
    .command('write')
    .description('Write interaction to the contract based on specified contract id')
    .argument('<contractId>', 'id of the contract')
    .argument('<interaction>', 'interaction object passed to the writeInteraction method')
    .option(
      '-str --strict',
      'if set, writeInteraction method evaluates the state and lets verify wether transaction has been processed correctly',
      false
    )
    .option(
      '-eo --evaluationOptions <options...>',
      'Specify evaluation options: allowBigInt | allowUnsafeClient | internalWrites'
    )
    .action(async (contractId, interaction, cmdOptions) => {
      if (options.silent !== true) {
        await printInfo();
      }
      writeInteraction(contractId, interaction, cmdOptions, options);
    });

  program
    .command('view')
    .description('View state of the contract based on specified contract id and provided input')
    .argument('<contractId>', 'id of the contract')
    .argument('<input>', 'input object passed to the viewState method')
    .option(
      '-eo --evaluationOptions <options...>',
      'Specify evaluation options: allowBigInt | allowUnsafeClient | internalWrites'
    )
    .action(async (contractId, interaction, cmdOptions) => {
      if (options.silent !== true) {
        await printInfo();
      }
      viewState(contractId, interaction, cmdOptions, options);
    });

  program
    .command('clear')
    .description('Clears cache')
    .action(() => {
      clearCache(options);
    });

  if (process.argv.length == 2) {
    await printInfo();
  }
  try {
    program.parse();
  } catch (e) {
    console.log(e);
  }
})();
