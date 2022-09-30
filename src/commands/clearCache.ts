import fs from 'fs';
import chalk from 'chalk';
import { chalkGreen } from '../utils/utils';
import { OptionValues } from 'commander';
import inquirer from 'inquirer';

export const clearCache = async (options: OptionValues) => {
  try {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'clearCache',
          message: `Are you sure you want to clear following location: ${process.cwd() + options.cacheLocation}?`
        }
      ])
      .then((answers) => {
        if (answers.clearCache == true) {
          fs.rmSync(process.cwd() + options.cacheLocation, { recursive: true, force: true });
          !options.silent && console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Cache cleared correctly.`);
        }
      });
  } catch (err: any) {
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while clearing cache: ${err.message} `);
    return;
  }
};
