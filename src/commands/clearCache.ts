import fs from 'fs';
import chalk from 'chalk';
import { chalkGreen } from '../utils/utils';

export const clearCache = async (options: any) => {
  try {
    fs.rmSync('cache', { recursive: true, force: true });
    console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
  } catch (err) {
    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while clearing cache: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
