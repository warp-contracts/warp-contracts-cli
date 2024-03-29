"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContract = void 0;
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const warp_contracts_1 = require("warp-contracts");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const mime_types_1 = __importDefault(require("mime-types"));
const warp_contracts_plugin_deploy_1 = require("warp-contracts-plugin-deploy");
const deployContract = async (options) => {
    const env = options.environment;
    let load;
    try {
        await deployPrompt(deployFunc, options, env, load);
    }
    catch (err) {
        !options.silent && load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${err.message} `);
        return;
    }
};
exports.deployContract = deployContract;
const deployFunc = async (options, env, state, sourceFile, sourceTxId, wasmSrc, wasmGlueCode, load, dataType, dataBody) => {
    const silent = options.silent;
    warp_contracts_1.LoggerFactory.INST.logLevel(options.level);
    !silent &&
        console.log(utils_1.chalkBlue.bold(`👽 [INFO]:`), `Initializing Warp in`, utils_1.chalkBlue.bold(`${env}`), 'environment.');
    const warp = (0, utils_1.getWarp)(env, options.cacheLocation);
    const [wallet] = await (0, utils_1.loadWallet)(warp, env, options);
    const initialState = fs_1.default.readFileSync(path_1.default.resolve(state), 'utf8');
    let contractSrc = null;
    let deployment;
    load = !silent && (0, utils_1.loader)('Deploying contract...');
    const body = dataBody
        ? mime_types_1.default.charset(dataType) == 'UTF-8'
            ? fs_1.default.readFileSync(path_1.default.resolve(dataBody), 'utf-8')
            : fs_1.default.readFileSync(path_1.default.resolve(dataBody))
        : null;
    if (sourceFile) {
        contractSrc = wasmSrc
            ? fs_1.default.readFileSync(path_1.default.resolve(sourceFile))
            : fs_1.default.readFileSync(path_1.default.resolve(sourceFile), 'utf8');
        deployment = await warp.deploy({
            wallet: env == 'local' ? wallet : new warp_contracts_plugin_deploy_1.ArweaveSigner(wallet),
            initState: initialState,
            src: contractSrc,
            ...(wasmSrc && { wasmSrcCodeDir: path_1.default.resolve(wasmSrc) }),
            ...(wasmGlueCode && { wasmGlueCode: path_1.default.resolve(wasmGlueCode) }),
            ...(dataType && {
                data: {
                    'Content-Type': dataType,
                    body
                }
            })
        });
    }
    else if (sourceTxId) {
        deployment = await warp.deployFromSourceTx({
            wallet,
            initState: JSON.stringify(initialState),
            srcTxId: sourceTxId,
            ...(dataType && { data: { 'Content-Type': dataType, body } })
        });
    }
    !silent && load.stop();
    !silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Contract deployed correctly. Contract:`);
    silent ? process.stdout.write(JSON.stringify(deployment)) : console.dir(deployment);
    !silent &&
        console.log(`${env == 'mainnet' || env == 'testnet'
            ? `View contract in SonAr: ${`https://sonar.warp.cc/#/app/contract/${deployment.contractTxId}${env == 'testnet' ? '?network=testnet' : ''}`}`
            : ''}`);
    !silent &&
        env == 'mainnet' &&
        dataBody &&
        console.log(`View contract data: https://d1o5nlqr4okus2.cloudfront.net/gateway/contract-data/${deployment.contractTxId}`);
};
const deployPrompt = async (deployFunc, options, env, load) => {
    inquirer_1.default
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
            inquirer_1.default
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
                    inquirer_1.default
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
                            inquirer_1.default
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
                                    inquirer_1.default
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
                                        await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load, dataType, dataBody);
                                    });
                                }
                                else {
                                    const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                                    await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load, null, null);
                                }
                            });
                        }
                        else if (answers.wasmLang == 'Assemblyscript' || answers.wasmLang == 'Go') {
                            inquirer_1.default
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
                                    inquirer_1.default
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
                                        await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, null, load, dataType, dataBody);
                                    });
                                }
                                else {
                                    const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                                    await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load, null, null);
                                }
                            });
                        }
                    });
                }
                else if (answers.sourceType == 'JS') {
                    inquirer_1.default
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
                            inquirer_1.default
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
                                await deployFunc(options, env, initialState, sourceFile, null, null, null, load, dataType, dataBody);
                            });
                        }
                        else {
                            const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                            console.log('State from answers', initialState);
                            await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load, null, null);
                        }
                    });
                }
            });
        }
        else if (answers.deployType == 'from source transaction id') {
            inquirer_1.default
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
                    inquirer_1.default
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
                }
                else {
                    const { sourceTxId, initialState, wasmSrc, wasmGlueCode } = answers;
                    await deployFunc(options, env, initialState, null, sourceTxId, wasmSrc, wasmGlueCode, load, null, null);
                }
            });
        }
    })
        .catch((error) => {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${error.message} `);
        return;
    });
};
//# sourceMappingURL=deployContract.js.map