import { Contract, LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import chalk from 'chalk';
import { getContract } from './readState';
import { OptionValues } from 'commander';

export const writeInteraction = async (
  contractId: string,
  interaction: string,
  cmdOptions: any,
  options: OptionValues
) => {
  const env = options.environment;
  const silent = options.silent;

  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level);

    const warp = getWarp(env, options.cacheLocation);
    !silent &&
      console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');
    const [wallet] = await loadWallet(warp, env, options);

    let contract: Contract;
    contract = getContract(cmdOptions, warp, contractId, true, wallet);

    load = !silent && loader('Writing interaction...');
    const result = await contract.writeInteraction(JSON.parse(interaction), cmdOptions.strict && { strict: true });
    !silent && load.stop();
    !silent && console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Interaction written correctly. Interaction:`);
    silent ? process.stdout.write(JSON.stringify(result)) : console.dir(result);
    !silent &&
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
    load && !silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while writing interaction: ${err.message} `);
    return;
  }
};
