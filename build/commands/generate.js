"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils/utils");
const generate = async (options) => {
    let data;
    let load;
    try {
        data = await fetch(`https://api.github.com/repos/warp-contracts/templates/contents`).then((res) => {
            return res.json();
        });
    }
    catch (e) {
        !options.silent && (0, utils_1.loader)('');
        !options.silent && load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
        return;
    }
    const templates = data.map(({ name }) => name);
    try {
        generatePrompt(templates, load, options);
    }
    catch (e) {
        !options.silent && (0, utils_1.loader)('');
        !options.silent && load.stop();
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while generating template: ${e.message} `);
        return;
    }
};
exports.generate = generate;
const generatePrompt = (templates, load, options) => {
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
                if (/^([A-Za-z\-\_\d])+$/.test(input))
                    return true;
                else
                    return 'Project name may only include letters, numbers, underscores and hashes.';
            }
        }
    ];
    inquirer_1.default.prompt(QUESTIONS).then((answers) => {
        const projectChoice = answers['project-choice'];
        const projectName = answers['project-name'];
        if (fs_1.default.existsSync(path_1.default.resolve(projectName))) {
            fs_1.default.rmSync(path_1.default.resolve(projectName), { recursive: true, force: true });
        }
        load = !options.silent && (0, utils_1.loader)('Generating template...');
        (0, child_process_1.exec)(`mkdir ${projectName} && cd ${projectName} && git init && git remote add -f origin https://github.com/warp-contracts/templates && git config core.sparseCheckout true && echo "${projectChoice}" >> .git/info/sparse-checkout && git pull origin main && git branch -m master main && git config core.sparseCheckout false`, (error, stdout, stderr) => {
            if (error) {
                console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while generating template: ${error.message} `);
                load.stop();
                return;
            }
            load.stop();
            !options.silent &&
                console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Template generated in ${projectName} directory.`);
        });
    });
};
//# sourceMappingURL=generate.js.map