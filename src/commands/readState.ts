import chalk from 'chalk';
import { Contract, LoggerFactory, Warp } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader } from '../utils/utils';
import fs from 'fs';
import { OptionValues } from 'commander';

export interface CmdOptions {
  evaluationOptions: string[];
  save: boolean;
  validity: boolean;
  errorMessages: boolean;
}

export const readState = async (contractId: string, cmdOptions: CmdOptions, options: OptionValues) => {
  const env = options.environment;
  const silent = options.silent;
  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level);
    const warp = getWarp(env, options.cacheLocation);
    !silent &&
      console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');

    let contract: Contract;
    contract = getContract(cmdOptions, warp, contractId, false);
    load = !silent && loader('Loading state...');

    const { cachedValue } = await contract.readState();
    !silent && load.stop();
    let readStateObj: { state: {}; validity?: {}; errorMessages?: {} } = { state: {} };
    if (cmdOptions.save) {
      const saveFile = typeof cmdOptions.save === 'string' ? cmdOptions.save : `state_${contractId}.json`;
      if (!cmdOptions.validity && !cmdOptions.errorMessages) {
        fs.writeFileSync(saveFile, JSON.stringify(cachedValue.state, null, 2));
      } else {
        readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
        fs.writeFileSync(saveFile, JSON.stringify(readStateObj, null, 2));
      }
      !silent && console.log(`${chalkGreen.bold(`🍭 [SUCCESS]:`)} State saved in: ${chalkBlue(saveFile)} file.`);
    } else {
      if (!cmdOptions.validity && !cmdOptions.errorMessages) {
        !silent && console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, chalkGreen(`${contractId}:`));
        silent
          ? process.stdout.write(JSON.stringify(cachedValue.state))
          : console.dir(cachedValue.state, { depth: null });
      } else {
        readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
        !silent && console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, chalkGreen(`${contractId}:`));
        silent ? process.stdout.write(JSON.stringify(readStateObj)) : console.dir(readStateObj, { depth: null });
      }
    }
  } catch (err) {
    load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while reading contract state: ${err.message} `);
    return;
  }
};

const getStateObj = (readStateObj: any, cachedValue: any, cmdOptions: any) => {
  readStateObj.state = cachedValue.state;
  if (cmdOptions.validity) {
    readStateObj.validity = cachedValue.validity;
  }
  if (cmdOptions.errorMessages) {
    readStateObj.errorMessages = cachedValue.errorMessages;
  }
  return readStateObj;
};

export const getContract = (cmdOptions: CmdOptions, warp: Warp, contractId: string, connect: boolean, wallet?: any) => {
  if (cmdOptions.evaluationOptions) {
    const evaluationOptionsList = cmdOptions.evaluationOptions.filter((option: string) =>
      ['allowBigInt', 'allowUnsafeClient', 'internalWrites'].includes(option)
    );
    const evaluationOptions = evaluationOptionsList.reduce((o: any, key: string) => ({ ...o, [key]: true }), {});
    const contract = warp.contract(contractId).setEvaluationOptions(evaluationOptions);
    connect && contract.connect(wallet);
    return contract;
  } else {
    const contract = warp.contract(contractId);
    connect && contract.connect(wallet);
    return contract;
  }
};
