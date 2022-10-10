import { Contract, Warp } from 'warp-contracts';
import { OptionValues } from 'commander';
export interface CmdOptions {
    evaluationOptions: string[];
    save: boolean;
    stateValidity: boolean;
    stateErrorMessages: boolean;
}
export declare const readState: (contractId: string, cmdOptions: CmdOptions, options: OptionValues) => Promise<void>;
export declare const getContract: (cmdOptions: CmdOptions, warp: Warp, contractId: string, connect: boolean, wallet?: any) => Contract<unknown>;
