/**
 * This type contains all data and meta-data of the given contact.
 */
/// <reference types="node" />
import { ContractType } from '../contract/deploy/CreateContract';
export declare class ContractMetadata {
    dtor: number;
}
export declare type ContractSource = {
    src: string | null;
    srcBinary: Buffer | null;
    srcWasmLang: string | null;
    contractType: ContractType;
    srcTx: any;
    metadata?: ContractMetadata;
};
export declare type ContractDefinition<State> = {
    txId: string;
    srcTxId: string;
    src: string | null;
    srcBinary: Buffer | null;
    srcWasmLang: string | null;
    initState: State;
    minFee: string;
    owner: string;
    contractType: ContractType;
    metadata?: ContractMetadata;
    contractTx: any;
    srcTx: any;
};
//# sourceMappingURL=ContractDefinition.d.ts.map