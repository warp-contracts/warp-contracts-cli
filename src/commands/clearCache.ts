import fs from 'fs';
import chalk from 'chalk';
import { chalkGreen } from '../utils/utils';

export const clearCache = async (options: any) => {
  const cache = options.cacheLocation.split('/', 2).join('/');
  try {
    fs.rmSync(process.cwd() + cache, { recursive: true, force: true });
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Cache cleared correctly.`);
  } catch (err) {
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while clearing cache: ${err.message} `);
    return;
  }
};
