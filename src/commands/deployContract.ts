import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import fs from 'fs';
import path from 'path';
import { ContractDeploy, LoggerFactory } from 'warp-contracts';
import chalk from 'chalk';

export const deployContract = async (state: string, cmdOptions: any, options: any) => {
  if (!cmdOptions.sourceFile && !cmdOptions.sourceTxId) {
    console.log(chalk.red(`💣 [ERROR]:`), `Either source transaction id or source file must be specified.`);
    return;
  }

  let load: any;
  try {
    LoggerFactory.INST.logLevel(options.level || 'error');
    console.log(
      chalkBlue.bold(`👽 [INFO]:`),
      `Initializing Warp in`,
      chalkBlue.bold(`${options.environment}`),
      'environment.'
    );
    const warp = getWarp(options.environment);
    const [wallet] = await loadWallet(warp, options.environment, options.wallet);
    const initialState = fs.readFileSync(path.resolve(state), 'utf8');

    let contractSrc: string | null = null;
    let deployment: ContractDeploy;
    load = loader('Deploying contract...');

    if (cmdOptions.sourceFile) {
      contractSrc = fs.readFileSync(path.resolve(cmdOptions.sourceFile), 'utf8');
      deployment = await warp.createContract.deploy({
        wallet,
        initState: JSON.stringify(initialState),
        src: contractSrc,
        ...(cmdOptions.wasmSrc && { wasmSrcCodeDir: path.resolve(cmdOptions.wasmSrc) }),
        ...(cmdOptions.wasmGlueCode && { wasmGlueCode: path.resolve(cmdOptions.wasmGlueCode) })
      });
    }

    if (cmdOptions.sourceTxId) {
      deployment = await warp.createContract.deployFromSourceTx({
        wallet,
        initState: JSON.stringify(initialState),
        srcTxId: cmdOptions.sourceTxId
      });
    }

    load.stop();
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Contract deployed correctly. Contract:`);
    console.dir(deployment);
    console.log(
      `${
        options.environment == 'mainnet' || options.environment == 'testnet'
          ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${deployment.contractTxId}${
              options.environment == 'testnet' ? '?network=testnet' : ''
            }`}`
          : ''
      }`
    );
  } catch (err) {
    load.stop();
    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while deploying contract: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
