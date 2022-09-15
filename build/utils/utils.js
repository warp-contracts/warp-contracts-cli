"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = exports.getPackageJson = exports.findClosestPackageJson = exports.getPackageJsonPath = exports.getPackageRoot = exports.printWarningAboutNodeJsVersionIfNecessary = exports.chalkGreen = exports.chalkBlue = exports.loadWallet = exports.getWarp = void 0;
const warp_contracts_1 = require("warp-contracts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const find_up_1 = __importDefault(require("find-up"));
const loading_cli_1 = __importDefault(require("loading-cli"));
const getWarp = (env) => {
    if (env == 'local') {
        return warp_contracts_1.WarpFactory.forLocal(1984);
    }
    else if (env == 'testnet') {
        return warp_contracts_1.WarpFactory.forTestnet();
    }
    else if (env == 'mainnet') {
        return warp_contracts_1.WarpFactory.forMainnet({ ...warp_contracts_1.defaultCacheOptions, inMemory: true });
    }
    else {
        throw new Error(chalk_1.default.red(`Unknown network:`, chalk_1.default.bgRed(`${env}`)));
    }
};
exports.getWarp = getWarp;
const loadWallet = async function (warp, env, walletPath) {
    let wallet;
    let walletDir = path_1.default.resolve('.secrets');
    let walletFilename = path_1.default.join(walletDir, `/wallet_${env}.json`);
    let load;
    if (!walletPath) {
        load = (0, exports.loader)('Generating wallet...');
        if (env === 'local' || env === 'testnet') {
            ({ jwk: wallet } = await warp.testing.generateWallet());
        }
        else {
            wallet = await warp.arweave.wallets.generate();
        }
        if (!fs_1.default.existsSync(walletDir))
            fs_1.default.mkdirSync(walletDir);
        fs_1.default.writeFileSync(walletFilename, JSON.stringify(wallet));
    }
    else {
        try {
            wallet = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(walletPath), 'utf8'));
            console.log((0, exports.chalkBlue)('👽 [INFO]:'), 'Wallet recognized correctly.');
        }
        catch (e) {
            throw new Error(chalk_1.default.red('Wallet file not found!'));
        }
    }
    const address = await warp.arweave.wallets.getAddress(wallet);
    load.stop();
    console.log(exports.chalkBlue.bold(`👽 [INFO]:`), `Wallet:`, exports.chalkBlue.bold(`${address}`), `generated in`, exports.chalkBlue.bold(`.secrets/wallet_${env}.json.`));
    return [wallet, address];
};
exports.loadWallet = loadWallet;
exports.chalkBlue = chalk_1.default.rgb(135, 206, 235);
exports.chalkGreen = chalk_1.default.rgb(34, 139, 34);
const printWarningAboutNodeJsVersionIfNecessary = (packageJson) => {
    const requirement = packageJson.engines.node;
    if (!semver_1.default.satisfies(process.version, requirement)) {
        console.warn(chalk_1.default.yellow(`You are using Node.js version: ${process.version} which is not supported by Warp. Supported version is: ${requirement}`));
    }
};
exports.printWarningAboutNodeJsVersionIfNecessary = printWarningAboutNodeJsVersionIfNecessary;
function getPackageRoot() {
    const packageJsonPath = getPackageJsonPath();
    return path_1.default.dirname(packageJsonPath);
}
exports.getPackageRoot = getPackageRoot;
function getPackageJsonPath() {
    return (0, exports.findClosestPackageJson)(__filename);
}
exports.getPackageJsonPath = getPackageJsonPath;
const findClosestPackageJson = (file) => {
    return find_up_1.default.sync('package.json', { cwd: path_1.default.dirname(file) });
};
exports.findClosestPackageJson = findClosestPackageJson;
const getPackageJson = () => {
    const root = getPackageRoot();
    return fs_extra_1.default.readJSON(path_1.default.join(root, 'package.json'));
};
exports.getPackageJson = getPackageJson;
const loader = (text) => {
    return (0, loading_cli_1.default)({
        text: chalk_1.default.magenta(text),
        frames: [
            '[    ]',
            '[=   ]',
            '[==  ]',
            '[=== ]',
            '[ ===]',
            '[  ==]',
            '[   =]',
            '[    ]',
            '[   =]',
            '[  ==]',
            '[ ===]',
            '[====]',
            '[=== ]',
            '[==  ]',
            '[=   ]'
        ],
        color: 'magenta',
        interval: 80
    }).start();
};
exports.loader = loader;
//# sourceMappingURL=utils.js.map