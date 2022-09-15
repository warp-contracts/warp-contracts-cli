import chalk from 'chalk';
import { Contract, LoggerFactory } from 'warp-contracts';
import { chalkBlue, chalkGreen, getWarp, loader } from '../utils/utils';
import fs from 'fs';

export const readState = async (contractId: string, cmdOptions: any, options: any) => {
  const env = options.environment;
  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level);
    const warp = getWarp(env, options.cacheLocation);
    console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');

    let contract: Contract;
    if (cmdOptions.evaluationOptions) {
      const evaluationOptionsList = cmdOptions.evaluationOptions.filter((option: string) =>
        ['allowBigInt', 'allowUnsafeClient', 'internalWrites'].includes(option)
      );
      const evaluationOptions = evaluationOptionsList.reduce((o: any, key: string) => ({ ...o, [key]: true }), {});
      contract = warp.contract(contractId).setEvaluationOptions(evaluationOptions);
    } else {
      contract = warp.contract(contractId);
    }

    load = loader('Loading state...');
    const { cachedValue } = await contract.readState();
    load.stop();

    let readStateObj: { state: {}; validity?: {}; errorMessages?: {} } = { state: {} };
    if (cmdOptions.save) {
      const saveFile = typeof cmdOptions.save === 'string' ? cmdOptions.save : `state_${contractId}.json`;

      if (!cmdOptions.validity && !cmdOptions.errorMessages) {
        fs.writeFileSync(saveFile, JSON.stringify(cachedValue.state, null, 2));
      } else {
        readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
        fs.writeFileSync(saveFile, JSON.stringify(readStateObj, null, 2));
      }
      console.log(`${chalkGreen.bold(`🍭 [SUCCESS]:`)} State saved in: ${chalkBlue(saveFile)} file.`);
    } else {
      if (!cmdOptions.validity && !cmdOptions.errorMessages) {
        console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, chalkGreen(`${contractId}:`));
        console.dir(cachedValue.state);
      } else {
        readStateObj = getStateObj(readStateObj, cachedValue, cmdOptions);
        console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `State for`, chalkGreen(`${contractId}:`));
        console.dir(readStateObj);
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
