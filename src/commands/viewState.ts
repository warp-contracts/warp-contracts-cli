import { LoggerFactory, LogLevel } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';
import { OptionValues } from 'commander';

export const viewState = async (contractId: string, interaction: string, cmdOptions: OptionValues, options: OptionValues) => {
  const { environment, level, cacheLocation, wallet: walletPath } = options;
  let load: any;
  try {
    LoggerFactory.INST.logLevel(level);

    const warp = getWarp(environment, cacheLocation);
    console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${environment}`), 'environment.');
    const [wallet] = await loadWallet(warp, environment, walletPath);

    const contract = warp.contract(contractId).connect(wallet);

    load = loader('Viewing state...');
    const result = await contract.viewState(JSON.parse(interaction));
    load.stop();

    if (result.type == 'error') {
      console.log(chalk.red.bold(`💣 [ERROR]:`), `View state executed incorrectly. Error message:`);
      console.dir(result.errorMessage);
    } else {
      console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
      console.dir(result.result);
    }
  } catch (err) {
    load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while viewing state: ${err.message} `);
    return;
  }
};
