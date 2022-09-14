import { LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import inquirer from 'inquirer';
import chalk from 'chalk';

export const writeInteraction = async (contractId: string, interaction: string, cmdOptions: any, options: any) => {
  // let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level || 'error');

    const warp = getWarp(options.environment);
    console.log(
      chalkBlue.bold(`👽 [INFO]:`),
      `Initializing Warp in`,
      chalkBlue.bold(`${options.environment}`),
      'environment.'
    );
    const [wallet] = await loadWallet(warp, options.environment, options.wallet);

    const contract = warp.contract(contractId).connect(wallet);

    // load = loader('Writing interaction...');
    console.log(JSON.parse(interaction));
    const result = await contract.writeInteraction(JSON.parse(interaction), cmdOptions.strict && { strict: true });
    // load.stop();
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Interaction written correctly. Interaction:`);
    console.dir(result);
    console.log(
      `${
        options.environment == 'mainnet' || options.environment == 'testnet'
          ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${result.originalTxId}${
              options.environment == 'testnet' ? '?network=testnet' : ''
            }`}`
          : ''
      }`
    );
  } catch (err) {
    // load.stop();

    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while writing interaction: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
