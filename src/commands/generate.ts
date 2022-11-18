import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import { OptionValues } from 'commander';
import chalk from 'chalk';
import { chalkGreen, loader } from '../utils/utils';

export const generate = async (options: OptionValues) => {
  let data: any;
  let load: any;

  try {
    data = await fetch(`https://api.github.com/repos/warp-contracts/templates/contents`).then((res) => {
      return res.json();
    });
  } catch (e) {
    !options.silent && loader('');
    !options.silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
    return;
  }
  const templates = data.map(({ name }) => name);

  try {
    generatePrompt(templates, load, options);
  } catch (e) {
    !options.silent && loader('');
    !options.silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
    return;
  }
};

const generatePrompt = (templates: string[], load: any, options: OptionValues) => {
  const QUESTIONS = [
    {
      name: 'project-choice',
      type: 'list',
      message: 'What project template would you like to generate?',
      choices: templates
    },
    {
      name: 'project-name',
      type: 'input',
      message: 'Project name:',
      validate: function (input) {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else return 'Project name may only include letters, numbers, underscores and hashes.';
      }
    }
  ];

  inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];

    if (fs.existsSync(path.resolve(projectName))) {
      fs.rmSync(path.resolve(projectName), { recursive: true, force: true });
    }

    load = !options.silent && loader('Generating template...');

    exec(
      `mkdir ${projectName} && cd ${projectName} && git init && git remote add -f origin https://github.com/warp-contracts/templates && git config core.sparseCheckout true && echo "${projectChoice}" >> .git/info/sparse-checkout && git pull origin main && git branch -m master main && git config core.sparseCheckout false`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while generating template: ${error.message} `);
          load.stop();
          return;
        }
        load.stop();
        !options.silent &&
          console.log(chalkGreen.bold(`🍭 [SUCCESS]:`), `Template generated in ${projectName} directory.`);
      }
    );
  });
};
