import fs from 'fs';
import chalk from 'chalk';
import { chalkGreen } from '../utils/utils';
import { OptionValues } from 'commander';

export const clearCache = async (options: OptionValues) => {
  try {
    const cache = options.cacheLocation.split('/', 2).join('/');
    fs.rmSync(process.cwd() + cache, { recursive: true, force: true });
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Cache cleared correctly.`);
  } catch (err: any) {
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while clearing cache: ${err.message} `);
    return;
  }
};
