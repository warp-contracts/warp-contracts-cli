import { Contract, LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';
import { CmdOptions, getContract } from './readState';
import { OptionValues } from 'commander';

export const writeInteraction = async (
  contractId: string,
  interaction: string,
  cmdOptions: any,
  options: OptionValues
) => {
  const env = options.environment;

  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level);

    const warp = getWarp(env, options.cacheLocation);
    console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');
    const [wallet] = await loadWallet(warp, env, options.wallet);

    let contract: Contract;
    contract = getContract(cmdOptions, warp, contractId, true, wallet);

    load = loader('Writing interaction...');
    console.log(JSON.parse(interaction));
    const result = await contract.writeInteraction(JSON.parse(interaction), cmdOptions.strict && { strict: true });
    load.stop();
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Interaction written correctly. Interaction:`);
    console.dir(result);
    console.log(
      `${
        env == 'mainnet' || env == 'testnet'
          ? `View interaction in SonAr: ${`https://sonar.warp.cc/#/app/contract/${result.originalTxId}${
              env == 'testnet' ? '?network=testnet' : ''
            }`}`
          : ''
      }`
    );
  } catch (err) {
    load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while writing interaction: ${err.message} `);
    return;
  }
};
