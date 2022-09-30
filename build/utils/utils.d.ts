import { Warp } from 'warp-contracts';
import { JWKInterface } from 'arweave/node/lib/wallet';
import chalk from 'chalk';
import loading from 'loading-cli';
import { OptionValues } from 'commander';
export interface PackageJson {
    name: string;
    version: string;
    engines: {
        node: string;
    };
}
export declare const getWarp: (env: string, cacheLocation: string) => Warp;
export declare const loadWallet: (warp: Warp, env: string, options: OptionValues) => Promise<[JWKInterface, string]>;
export declare const chalkBlue: chalk.Chalk;
export declare const chalkGreen: chalk.Chalk;
export declare const printWarningAboutNodeJsVersionIfNecessary: (packageJson: PackageJson) => void;
export declare function getPackageRoot(): string;
export declare function getPackageJsonPath(): string;
export declare const findClosestPackageJson: (file: string) => string;
export declare const getPackageJson: () => Promise<PackageJson>;
export declare const loader: (text: string) => loading.Loading;
export declare const printInfo: () => Promise<void>;
