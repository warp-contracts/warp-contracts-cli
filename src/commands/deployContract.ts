import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import fs from 'fs';
import path from 'path';
import { ContractDeploy, LoggerFactory } from 'warp-contracts';
import chalk from 'chalk';
import { deployPrompt } from '../utils/deploy';

export const deployContract = async (options: any) => {
  const env = options.environment;

  let load: any;
  try {
    await deployPrompt(deployFunc, options, env, load);
  } catch (err) {
    load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${err.message} `);
    return;
  }
};

const deployFunc = async (
  options: any,
  env: string,
  state: string,
  sourceFile: string,
  sourceTxId: string,
  wasmSrc: string,
  wasmGlueCode: string,
  load: any
) => {
  LoggerFactory.INST.logLevel(options.level);
  console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');
  const warp = getWarp(env, options.cacheLocation);
  const [wallet] = await loadWallet(warp, env, options.wallet);
  const initialState = fs.readFileSync(path.resolve(state), 'utf8');

  let contractSrc: any = null;
  let deployment: ContractDeploy;
  load = loader('Deploying contract...');

  if (sourceFile) {
    contractSrc = wasmSrc
      ? fs.readFileSync(path.resolve(sourceFile))
      : fs.readFileSync(path.resolve(sourceFile), 'utf8');
    deployment = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
      ...(wasmSrc && { wasmSrcCodeDir: path.resolve(wasmSrc) }),
      ...(wasmGlueCode && { wasmGlueCode: path.resolve(wasmGlueCode) })
    });
  }

  if (sourceTxId) {
    deployment = await warp.createContract.deployFromSourceTx({
      wallet,
      initState: JSON.stringify(initialState),
      srcTxId: sourceTxId
    });
  }

  load.stop();
  console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Contract deployed correctly. Contract:`);
  console.dir(deployment);
  console.log(
    `${
      env == 'mainnet' || env == 'testnet'
        ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${deployment.contractTxId}${
            env == 'testnet' ? '?network=testnet' : ''
          }`}`
        : ''
    }`
  );
};
