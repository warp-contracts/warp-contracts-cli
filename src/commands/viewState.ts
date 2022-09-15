import { LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';

export const viewState = async (contractId: string, interaction: string, cmdOptions: any, options: any) => {
  const env = options.environment;
  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level);

    const warp = getWarp(env, options.cacheLocation);
    console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');
    const [wallet] = await loadWallet(warp, env, options.wallet);

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
