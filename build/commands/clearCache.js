"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils/utils");
const clearCache = async (options) => {
    try {
        fs_1.default.rmSync('cache', { recursive: true, force: true });
        console.log(utils_1.chalkGreen.bold(`🍭 [SUCCESS]:`), `View state executed correctly. Result:`);
    }
    catch (err) {
        console.error(chalk_1.default.red.bold(`💣 [ERROR]:`), `Error while clearing cache: ${options.debug ? err.stack : err.message} `);
        return;
    }
};
exports.clearCache = clearCache;
//# sourceMappingURL=clearCache.js.map