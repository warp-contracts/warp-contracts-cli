"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployPrompt = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
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
                                }
                            ])
                                .then(async (answers) => {
                                const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                                await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load);
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
                                }
                            ])
                                .then(async (answers) => {
                                const { sourceFile, initialState, wasmSrc } = answers;
                                await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, null, load);
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
                        }
                    ])
                        .then(async (answers) => {
                        const { sourceFile, initialState } = answers;
                        await deployFunc(options, env, initialState, sourceFile, null, null, null, load);
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
                }
            ])
                .then(async (answers) => {
                const { sourceTxId, initialState } = answers;
                await deployFunc(options, env, initialState, null, sourceTxId, null, null, load);
            });
        }
    })
        .catch((error) => {
        load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${error.message} `);
        return;
    });
};
exports.deployPrompt = deployPrompt;
//# sourceMappingURL=deploy.js.map