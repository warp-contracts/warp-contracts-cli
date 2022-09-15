import chalk from 'chalk';
import inquirer from 'inquirer';

export const deployPrompt = async (deployFunc: any, options: any, env: string, load: any) => {
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
                        }
                      ])
                      .then(async (answers) => {
                        const { sourceFile, initialState, wasmSrc, wasmGlueCode } = answers;
                        await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, wasmGlueCode, load);
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
                        }
                      ])
                      .then(async (answers) => {
                        const { sourceFile, initialState, wasmSrc } = answers;
                        await deployFunc(options, env, initialState, sourceFile, null, wasmSrc, null, load);
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
                  }
                ])
                .then(async (answers) => {
                  const { sourceFile, initialState } = answers;
                  await deployFunc(options, env, initialState, sourceFile, null, null, null, load);
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
      console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while deploying contract: ${error.message} `);
      return;
    });
};
