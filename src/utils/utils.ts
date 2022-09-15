import { WarpFactory, defaultCacheOptions, Warp, ArWallet } from 'warp-contracts';
import fs from 'fs';
import path from 'path';
import { JWKInterface } from 'arweave/node/lib/wallet';
import chalk from 'chalk';
import semver from 'semver';
import fsExtra from 'fs-extra';
import findup from 'find-up';
import loading from 'loading-cli';

export interface PackageJson {
  name: string;
  version: string;
  engines: {
    node: string;
  };
}

export const getWarp = (env: string, cacheLocation: string) => {
  const cache = process.cwd() + cacheLocation;
  if (env == 'local') {
    return WarpFactory.forLocal(1984);
  } else if (env == 'testnet') {
    return WarpFactory.forTestnet();
  } else if (env == 'mainnet') {
    return WarpFactory.forMainnet({ dbLocation: cache, ...defaultCacheOptions });
  } else {
    throw new Error(chalk.red(`Unknown network:`, chalk.bgRed(`${env}`)));
  }
};

export const loadWallet = async function (
  warp: Warp,
  env: string,
  walletPath: string
): Promise<[JWKInterface, string]> {
  let wallet: JWKInterface;
  let walletDir = path.resolve('.secrets');
  let walletFilename = path.join(walletDir, `/wallet_${env}.json`);
  let load: any;
  if (!walletPath) {
    load = loader('Generating wallet...');

    if (env === 'local' || env === 'testnet') {
      ({ jwk: wallet } = await warp.testing.generateWallet());
    } else {
      wallet = await warp.arweave.wallets.generate();
    }
    if (!fs.existsSync(walletDir)) fs.mkdirSync(walletDir);
    fs.writeFileSync(walletFilename, JSON.stringify(wallet));
  } else {
    try {
      wallet = JSON.parse(fs.readFileSync(path.resolve(walletPath), 'utf8'));
      console.log(chalkBlue('👽 [INFO]:'), 'Wallet recognized correctly.');
    } catch (e) {
      throw new Error(chalk.red('Wallet file not found!'));
    }
  }
  const address = await warp.arweave.wallets.getAddress(wallet);
  load.stop();
  console.log(
    chalkBlue.bold(`👽 [INFO]:`),
    `Wallet:`,
    chalkBlue.bold(`${address}`),
    `generated in`,
    chalkBlue.bold(`.secrets/wallet_${env}.json.`)
  );
  return [wallet, address];
};

export const chalkBlue = chalk.rgb(135, 206, 235);

export const chalkGreen = chalk.rgb(34, 139, 34);

export const printWarningAboutNodeJsVersionIfNecessary = (packageJson: PackageJson) => {
  const requirement = packageJson.engines.node;
  if (!semver.satisfies(process.version, requirement)) {
    console.warn(
      chalk.yellow(
        `You are using Node.js version: ${process.version} which is not supported by Warp. Supported version is: ${requirement}`
      )
    );
  }
};

export function getPackageRoot(): string {
  const packageJsonPath = getPackageJsonPath();

  return path.dirname(packageJsonPath);
}

export function getPackageJsonPath(): string {
  return findClosestPackageJson(__filename)!;
}

export const findClosestPackageJson = (file: string) => {
  return findup.sync('package.json', { cwd: path.dirname(file) });
};

export const getPackageJson = (): Promise<PackageJson> => {
  const root = getPackageRoot();
  return fsExtra.readJSON(path.join(root, 'package.json'));
};

export const loader = (text: string) => {
  return loading({
    text: chalk.magenta(text),
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
