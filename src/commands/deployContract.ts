import { chalkBlue, chalkGreen, getWarp, loader, loadWallet } from '../utils/utils';
import fs from 'fs';
import path from 'path';
import { ContractDeploy, LoggerFactory, LogLevel } from 'warp-contracts';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { OptionValues } from 'commander';
import mime from 'mime-types';

export const deployContract = async (options: OptionValues) => {
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
  options: OptionValues,
  env: string,
  state: string,
  sourceFile: string,
  sourceTxId: string,
  wasmSrc: string,
  wasmGlueCode: string,
  load: any,
  dataType: string,
  dataBody: any
) => {
  LoggerFactory.INST.logLevel(options.level);
  console.log(chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, chalkBlue.bold(`${env}`), 'environment.');
  const warp = getWarp(env, options.cacheLocation);
  const [wallet] = await loadWallet(warp, env, options.wallet);
  const initialState = fs.readFileSync(path.resolve(state), 'utf8');
  let contractSrc: any = null;
  let deployment: ContractDeploy;
  load = loader('Deploying contract...');
  const body = dataBody
    ? mime.charset(dataType) == 'UTF-8'
      ? fs.readFileSync(path.resolve(dataBody), 'utf-8')
      : fs.readFileSync(path.resolve(dataBody))
    : null;
  if (sourceFile) {
    contractSrc = wasmSrc
      ? fs.readFileSync(path.resolve(sourceFile))
      : fs.readFileSync(path.resolve(sourceFile), 'utf8');
    deployment = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
      ...(wasmSrc && { wasmSrcCodeDir: path.resolve(wasmSrc) }),
      ...(wasmGlueCode && { wasmGlueCode: path.resolve(wasmGlueCode) }),
      ...(dataType && {
        data: {
          'Content-Type': dataType,
          body
        }
      })
    });
  } else if (sourceTxId) {
    deployment = await warp.createContract.deployFromSourceTx({
      wallet,
      initState: JSON.stringify(initialState),
      srcTxId: sourceTxId,
      ...(dataType && { data: { 'Content-Type': dataType, body } })
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
  env == 'mainnet' &&
    dataBody &&
    console.log(
      `View contract data: https://d1o5nlqr4okus2.cloudfront.net/gateway/contract-data/${deployment.contractTxId}`
    );
};

const deployPrompt = async (deployFunc: any, options: OptionValues, env: string, load: any) => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'deployType',
        message: 'How do you want to deploy your contract?',
        choices: ['from source file', 'from source transaction id']
      }
    ])
    .then((answers) => {
      if (answers.deployType == 'from source file') {
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'sourceType',
              message: 'What is the source type of the contract?',
              choices: ['JS', 'WASM']
            }
          ])
          .then((answers) => {
            if (answers.sourceType == 'WASM') {
              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'wasmLang',
                    message: 'What is the language of the contract?',
                    choices: ['Rust', 'Assemblyscript', 'Go']
                  }
                ])
                .then((answers) => {
                  if (answers.wasmLang == 'Rust') {
                    inquirer
                      .prompt([
                        {
                          type: 'input',
                          name: 'sourceFile',
                          message: 'Provide relative path to the contract source file (e.g.: ./pkg/contract_bg.wasm)'
                        },
                        {
                          type: 'input',
                          name: 'initialState',
                          message: 'Provide relative path to the initial state file (e.g.: ./state.json)'
                        },
                        {
                          type: 'input',
                          name: 'wasmSrc',
                          message: 'Provide relative path to the WASM source folder (e.g.: ./src)'
                        },
                        {
                          type: 'input',
                          name: 'wasmGlueCode',
                          message: 'Provide relative path to the WASM glue code (e.g.: ./pkg/contract.js)'
                        },
                        {
                          type: 'confirm',
                          name: 'dataConfirm',
                          default: false,
                          message: 'Would you like to send data asset within your contract (e.g. to create AtomicNFT)?'
                        }
                      ])
                      .then(async (answers) => {
                        if (answers.dataConfirm == true) {
                          inquirer
                            .prompt([
                              {
                                type: 'input',
                                name: 'dataType',
                                message: 'Provide data type (e.g.: image/png)'
                              },
                              {
                                type: 'input',
                                name: 'dataBody',
                                message: 'Provide relative path to body of your data (e.g.: /path-to-data/image.png)'
                              }
                            ])
                            .then(async (answers2) => {
                              const { dataType, dataBody } = answers2;
                              const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                              await deployFunc(
                                options,
                                env,
                                initialState,
                                sourceFile,
                                null,
                                wasmSrc,
                                wasmGlueCode,
                                load,
                                dataType,
                                dataBody
                              );
                            });
                        } else {
                          const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                          await deployFunc(
                            options,
                            env,
                            initialState,
                            sourceFile,
                            null,
                            wasmSrc,
                            wasmGlueCode,
                            load,
                            null,
                            null
                          );
                        }
                      });
                  } else if (answers.wasmLang == 'Assemblyscript' || answers.wasmLang == 'Go') {
                    inquirer
                      .prompt([
                        {
                          type: 'input',
                          name: 'sourceFile',
                          message: 'Provide relative path to the contract source file (e.g.: ./pkg/contract_bg.wasm)'
                        },
                        {
                          type: 'input',
                          name: 'initialState',
                          message: 'Provide relative path to the initial state file (e.g.: ./state.json)'
                        },
                        {
                          type: 'input',
                          name: 'wasmSrc',
                          message: 'Provide relative path to the WASM source folder (e.g.: ./src)'
                        },
                        {
                          type: 'confirm',
                          name: 'dataConfirm',
                          default: false,
                          message: 'Would you like to send data asset within your contract (e.g. to create AtomicNFT)?'
                        }
                      ])
                      .then(async (answers) => {
                        if (answers.dataConfirm == true) {
                          inquirer
                            .prompt([
                              {
                                type: 'input',
                                name: 'dataType',
                                message: 'Provide data type (e.g.: image/png)'
                              },
                              {
                                type: 'input',
                                name: 'dataBody',
                                message: 'Provide relative path to body of your data (e.g.: /path-to-data/image.png)'
                              }
                            ])
                            .then(async (answers2) => {
                              const { dataType, dataBody } = answers2;
                              const { sourceFile, initialState, wasmSrc } = answers;
                              await deployFunc(
                                options,
                                env,
                                initialState,
                                sourceFile,
                                null,
                                wasmSrc,
                                null,
                                load,
                                dataType,
                                dataBody
                              );
                            });
                        } else {
                          const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                          await deployFunc(
                            options,
                            env,
                            initialState,
                            sourceFile,
                            null,
                            wasmSrc,
                            wasmGlueCode,
                            load,
                            null,
                            null
                          );
                        }
                      });
                  }
                });
            } else if (answers.sourceType == 'JS') {
              inquirer
                .prompt([
                  {
                    type: 'input',
                    name: 'sourceFile',
                    message: 'Provide relative path to the contract source file (e.g.: ./contract.js)'
                  },
                  {
                    type: 'input',
                    name: 'initialState',
                    message: 'Provide relative path to the initial state file (e.g.: ./state.json)'
                  },
                  {
                    type: 'confirm',
                    name: 'dataConfirm',
                    default: false,
                    message: 'Would you like to send data asset within your contract (e.g. to create AtomicNFT)?'
                  }
                ])
                .then(async (answers) => {
                  if (answers.dataConfirm == true) {
                    inquirer
                      .prompt([
                        {
                          type: 'input',
                          name: 'dataType',
                          message: 'Provide data type (e.g.: image/png)'
                        },
                        {
                          type: 'input',
                          name: 'dataBody',
                          message: 'Provide relative path to body of your data (e.g.: /path-to-data/image.png)'
                        }
                      ])
                      .then(async (answers2) => {
                        const { dataType, dataBody } = answers2;
                        const { sourceFile, initialState } = answers;
                        await deployFunc(
                          options,
                          env,
                          initialState,
                          sourceFile,
                          null,
                          null,
                          null,
                          load,
                          dataType,
                          dataBody
                        );
                      });
                  } else {
                    const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                    await deployFunc(
                      options,
                      env,
                      initialState,
                      sourceFile,
                      null,
                      wasmSrc,
                      wasmGlueCode,
                      load,
                      null,
                      null
                    );
                  }
                });
            }
          });
      } else if (answers.deployType == 'from source transaction id') {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'sourceTxId',
              message: 'Provide source transaction id'
            },
            {
              type: 'input',
              name: 'initialState',
              message: 'Provide relative path to the initial state file (e.g.: ./state.json)'
            },
            {
              type: 'confirm',
              name: 'dataConfirm',
              default: false,
              message: 'Would you like to send data asset within your contract (e.g. to create AtomicNFT)?'
            }
          ])
          .then(async (answers) => {
            if (answers.dataConfirm == true) {
              inquirer
                .prompt([
                  {
                    type: 'input',
                    name: 'dataType',
                    message: 'Provide data type (e.g.: image/png)'
                  },
                  {
                    type: 'input',
                    name: 'dataBody',
                    message: 'Provide relative path to body of your data (e.g.: /path-to-data/image.png)'
                  }
                ])
                .then(async (answers) => {
                  const { sourceTxId, initialState, dataType, dataBody } = answers;
                  await deployFunc(options, env, initialState, null, sourceTxId, null, null, load, dataType, dataBody);
                });
            } else {
              const { sourceTxId, initialState, wasmSrc, wasmGlueCode } = answers;
              await deployFunc(options, env, initialState, null, sourceTxId, wasmSrc, wasmGlueCode, load, null, null);
            }
          });
      }
    })
    .catch((error: any) => {
      load.stop();
      console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${error.message} `);
      return;
    });
};
