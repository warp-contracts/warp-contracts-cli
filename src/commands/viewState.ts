import { LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';

export const viewState = async (contractId: string, interaction: string, cmdOptions: any, options: any) => {
  if (!options.environment) {
    console.log(chalk.red(`💣 [ERROR]:`), `-env --environment option must be specified.`);
    return;
  }
  let load: any;
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

    load = loader('Viewing state...');
    console.log(JSON.parse(interaction));
    const result = await contract.viewState(JSON.parse(interaction));
    load.stop();
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
    console.dir(result);
  } catch (err) {
    load.stop();

    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while viewing state: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
