/// <reference types="node" />
import { JWKInterface } from 'arweave/node/lib/wallet';
export declare type Tags = {
    name: string;
    value: string;
}[];
export declare type ArWallet = JWKInterface | 'use_wallet';
export declare type ContractType = 'js' | 'wasm';
export declare type ArTransfer = {
    target: string;
    winstonQty: string;
};
export declare const emptyTransfer: ArTransfer;
export interface CommonContractData {
    wallet: ArWallet;
    initState: string;
    tags?: Tags;
    transfer?: ArTransfer;
    data?: {
        'Content-Type': string;
        body: string | Uint8Array | ArrayBuffer;
    };
}
export interface ContractData extends CommonContractData {
    src: string | Buffer;
    wasmSrcCodeDir?: string;
    wasmGlueCode?: string;
}
export interface FromSrcTxContractData extends CommonContractData {
    srcTxId: string;
}
export interface ContractDeploy {
    contractTxId: string;
    srcTxId: string;
}
export interface CreateContract {
    deploy(contractData: ContractData, disableBundling?: boolean): Promise<ContractDeploy>;
    deployFromSourceTx(contractData: FromSrcTxContractData, disableBundling?: boolean): Promise<ContractDeploy>;
}
//# sourceMappingURL=CreateContract.d.ts.map