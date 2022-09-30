import { LoggerFactory, LogLevel } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';
import { OptionValues } from 'commander';
import { getContract } from './readState';

export const viewState = async (contractId: string, interaction: string, cmdOptions: any, options: OptionValues) => {
  const { environment, level, cacheLocation, silent } = options;
  let load: any;
  try {
    LoggerFactory.INST.logLevel(level);

    const warp = getWarp(environment, cacheLocation);
    !silent &&
      console.log(
        chalkBlue.bold(`👽 [INFO]:`),
        `Initializing Warp in`,
        chalkBlue.bold(`${environment}`),
        'environment.'
      );
    const [wallet] = await loadWallet(warp, environment, options);

    const contract = getContract(cmdOptions, warp, contractId, true, wallet);

    load = !silent && loader('Viewing state...');
    const result = await contract.viewState(JSON.parse(interaction));
    !silent && load.stop();

    if (result.type == 'error') {
      console.log(chalk.red.bold(`💣 [ERROR]:`), `View state executed incorrectly. Error message:`);
      silent ? process.stdout.write(result.errorMessage) : console.dir(result.errorMessage);
    } else {
      !silent && console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
      silent ? process.stdout.write(JSON.stringify(result.result)) : console.dir(result.result);
    }
  } catch (err) {
    load && !silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while viewing state: ${err.message} `);
    return;
  }
};
