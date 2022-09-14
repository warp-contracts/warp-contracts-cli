import chalk from 'chalk';
import { LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader } from '../utils/utils';
import loading from 'loading-cli';
import color from 'colors-cli';
import fs from 'fs';

export const readState = async (contractId: string, cmdOptions: any, options: any) => {
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
    const contract = warp.contract(contractId);

    load = loader('Loading state...');

    const { cachedValue } = await contract.readState();
    load.stop();
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, chalkGreen(`${contractId}:`));
    console.dir(JSON.parse(cachedValue.state as string));

    if (cmdOptions.save) {
      fs.writeFileSync(`state_${contractId}.json`, JSON.stringify(JSON.parse(cachedValue.state as string), null, 2));
      console.log(`${chalkBlue.bold(`👽 [INFO]:`)} State saved in: ${chalkBlue(`state_${contractId}.json`)} file.`);
    }
  } catch (err) {
    load.stop();
    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while deploying contract: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
