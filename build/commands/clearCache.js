"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils/utils");
const inquirer_1 = __importDefault(require("inquirer"));
const clearCache = async (options) => {
    try {
        inquirer_1.default
            .prompt([
            {
                type: 'confirm',
                name: 'clearCache',
                message: `Are you sure you want to clear following location: ${process.cwd() + options.cacheLocation}?`
            }
        ])
            .then((answers) => {
            if (answers.clearCache == true) {
                fs_1.default.rmSync(process.cwd() + options.cacheLocation, { recursive: true, force: true });
                !options.silent && console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `Cache cleared correctly.`);
            }
        });
    }
    catch (err) {
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while clearing cache: ${err.message} `);
        return;
    }
};
exports.clearCache = clearCache;
//# sourceMappingURL=clearCache.js.map