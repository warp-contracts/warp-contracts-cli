"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printInfo = exports.loader = exports.getPackageJson = exports.findClosestPackageJson = exports.getPackageJsonPath = exports.getPackageRoot = exports.printWarningAboutNodeJsVersionIfNecessary = exports.chalkGreen = exports.chalkBlue = exports.loadWallet = exports.getWarp = void 0;
const warp_contracts_1 = require("warp-contracts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const find_up_1 = __importDefault(require("find-up"));
const loading_cli_1 = __importDefault(require("loading-cli"));
const clear_1 = __importDefault(require("clear"));
const figlet_1 = __importDefault(require("figlet"));
const warp_contracts_plugin_deploy_1 = require("warp-contracts-plugin-deploy");
const warp_contracts_plugin_ethers_1 = require("warp-contracts-plugin-ethers");
const warp_contracts_plugin_nlp_1 = require("warp-contracts-plugin-nlp");
//@ts-ignore
const server_1 = require("warp-contracts-plugin-signature/server");
const warp_contracts_plugin_vrf_1 = require("warp-contracts-plugin-vrf");
const warp_contracts_plugin_jwt_verify_1 = require("@othent/warp-contracts-plugin-jwt-verify");
const getWarp = (env, cacheLocation) => {
    const cache = process.cwd() + cacheLocation;
    if (env == 'local') {
        return warp_contracts_1.WarpFactory.forLocal()
            .use(new warp_contracts_plugin_deploy_1.DeployPlugin())
            .use(new warp_contracts_plugin_ethers_1.EthersExtension())
            .use(new warp_contracts_plugin_nlp_1.NlpExtension())
            .use(new server_1.EvmSignatureVerificationServerPlugin())
            .use(new warp_contracts_plugin_vrf_1.VRFPlugin())
            .use(new warp_contracts_plugin_jwt_verify_1.JWTVerifyPlugin());
    }
    else if (env == 'testnet') {
        return warp_contracts_1.WarpFactory.forTestnet()
            .use(new warp_contracts_plugin_deploy_1.DeployPlugin())
            .use(new warp_contracts_plugin_ethers_1.EthersExtension())
            .use(new warp_contracts_plugin_nlp_1.NlpExtension())
            .use(new server_1.EvmSignatureVerificationServerPlugin())
            .use(new warp_contracts_plugin_vrf_1.VRFPlugin())
            .use(new warp_contracts_plugin_jwt_verify_1.JWTVerifyPlugin());
    }
    else if (env == 'mainnet') {
        return warp_contracts_1.WarpFactory.forMainnet({ dbLocation: cache, ...warp_contracts_1.defaultCacheOptions })
            .use(new warp_contracts_plugin_deploy_1.DeployPlugin())
            .use(new warp_contracts_plugin_ethers_1.EthersExtension())
            .use(new warp_contracts_plugin_nlp_1.NlpExtension())
            .use(new server_1.EvmSignatureVerificationServerPlugin())
            .use(new warp_contracts_plugin_vrf_1.VRFPlugin())
            .use(new warp_contracts_plugin_jwt_verify_1.JWTVerifyPlugin());
    }
    else {
        throw new Error(chalk_1.default.red(`Unknown network:`, chalk_1.default.bgRed(`${env}`)));
    }
};
exports.getWarp = getWarp;
const loadWallet = async function (warp, env, options) {
    let wallet;
    let walletDir = path_1.default.resolve('.secrets');
    let walletFilename = path_1.default.join(walletDir, `/wallet_${env}.json`);
    let load;
    const silent = options.silent;
    const walletPath = options.wallet;
    if (!walletPath) {
        if (fs_1.default.existsSync(walletFilename)) {
            load = !silent && (0, exports.loader)('Wallet recognition...');
            wallet = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(walletFilename), 'utf8'));
            !silent && console.log((0, exports.chalkBlue)('👽 [INFO]:'), 'Wallet recognized correctly.');
        }
        else {
            load = !silent && (0, exports.loader)('Generating wallet...');
            ({ jwk: wallet } = await warp.generateWallet());
            if (!fs_1.default.existsSync(walletDir))
                fs_1.default.mkdirSync(walletDir);
            fs_1.default.writeFileSync(walletFilename, JSON.stringify(wallet));
        }
    }
    else {
        try {
            load = !silent && (0, exports.loader)('Wallet recognition...');
            wallet = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(walletPath), 'utf8'));
            !silent && console.log((0, exports.chalkBlue)('👽 [INFO]:'), 'Wallet recognized correctly.');
        }
        catch (e) {
            !silent && load.stop();
            throw new Error(chalk_1.default.red('Wallet file not found!'));
        }
    }
    const address = await warp.arweave.wallets.getAddress(wallet);
    !silent && load.stop();
    !silent &&
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
const printInfo = async () => {
    (0, clear_1.default)();
    const packageJson = await (0, exports.getPackageJson)();
    (0, exports.printWarningAboutNodeJsVersionIfNecessary)(packageJson);
    console.log((0, exports.chalkBlue)(figlet_1.default.textSync('WARP', {
        horizontalLayout: 'full',
        font: 'Speed'
    })));
    console.log((0, exports.chalkBlue)(`👾👾👾 Welcome to Warp Contracts CLI v.${packageJson.version} 👾👾👾\n`));
};
exports.printInfo = printInfo;
//# sourceMappingURL=utils.js.map