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
  let uiData: any;

  try {
    data = await fetch(`https://api.github.com/repos/warp-contracts/templates/contents/contracts`).then((res) => {
      return res.json();
    });
    uiData = await fetch(`https://api.github.com/repos/warp-contracts/templates/contents/app`).then((res) => {
      return res.json();
    });
  } catch (e) {
    !options.silent && loader('');
    !options.silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
    return;
  }
  const templates = data.map(({ name }) => name);
  const uiTemplates = uiData.map(({ name }) => name);

  try {
    generatePrompt(templates, uiTemplates, load, options);
  } catch (e) {
    !options.silent && loader('');
    !options.silent && load.stop();
    console.error(chalk.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
    return;
  }
};

const generatePrompt = (templates: string[], uiTemplates: string[], load: any, options: OptionValues) => {
  let createProject = (projectName: string, projectChoice: string, appChoice?: string) => {
    if (fs.existsSync(path.resolve(projectName))) {
      fs.rmSync(path.resolve(projectName), { recursive: true, force: true });
    }

    load = !options.silent && loader('Generating template...');
    console.log('is not undefined' + appChoice !== 'undefined');
    console.log('app choice is: ' + appChoice);
    console.log(!appChoice);
    exec(
      appChoice
        ? `mkdir ${projectName} && cd ${projectName} && git init && git remote add -f origin https://github.com/warp-contracts/templates && git config core.sparseCheckout true && echo "${projectChoice}" >> .git/info/sparse-checkout && echo "${appChoice}" >> .git/info/sparse-checkout && git pull origin main && rm -rf .git && cd contracts && mv ${projectChoice}/* . && rm -r ${projectChoice} && cd ../app && mv ${appChoice}/* . && rm -r ${appChoice}`
        : `mkdir ${projectName} && cd ${projectName} && git init && git remote add -f origin https://github.com/warp-contracts/templates && git config core.sparseCheckout true && echo "${projectChoice}" >> .git/info/sparse-checkout && git pull origin main && rm -rf .git && cd contracts && mv ${projectChoice}/* . && rm -r ${projectChoice}`,
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
  };
  const QUESTIONS = [
    {
      name: 'project-name',
      type: 'input',
      message: 'Project name:',
      validate: function (input) {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else return 'Project name may only include letters, numbers, underscores and hashes.';
      }
    },
    {
      name: 'project-choice',
      type: 'list',
      message: 'What project template would you like to generate?',
      choices: templates
    },
    {
      name: 'app-confirm',
      type: 'confirm',
      default: false,
      message: 'Do you want to generate template for UI app?'
    }
  ];

  const APP = [
    {
      name: 'app-choice',
      type: 'list',
      message: 'What UI template would you like to generate?',
      choices: uiTemplates
    }
  ];

  inquirer.prompt(QUESTIONS).then((answers) => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];
    const appConfirm = answers['app-confirm'];

    if (appConfirm == true) {
      inquirer.prompt(APP).then((answers) => {
        const appChoice = answers['app-choice'];
        createProject(projectName, projectChoice, appChoice);
      });
    } else {
      createProject(projectName, projectChoice);
    }
  });
};
