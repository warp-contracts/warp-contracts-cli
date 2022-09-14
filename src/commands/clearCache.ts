import fs from 'fs';
import chalk from 'chalk';

export const clearCache = async (options: any) => {
  try {
    fs.rmSync('cache', { recursive: true, force: true });
  } catch (err) {
    console.error(
      chalk.red.bold(`💣 [ERROR]:`),
      `Error while clearing cache: ${options.debug ? err.stack : err.message} `
    );
    return;
  }
};
