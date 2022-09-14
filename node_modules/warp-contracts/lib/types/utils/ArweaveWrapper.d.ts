/// <reference types="node" />
import Arweave from 'arweave';
import { NetworkInfoInterface } from 'arweave/node/network';
import { AxiosResponse } from 'axios';
import Transaction from 'arweave/node/lib/transaction';
import { BlockData } from 'arweave/node/blocks';
import { GqlReqVariables } from '../core/modules/impl/ArweaveGatewayInteractionsLoader';
export declare class ArweaveWrapper {
    private readonly arweave;
    private readonly logger;
    private readonly baseUrl;
    constructor(arweave: Arweave);
    warpGwInfo(): Promise<NetworkInfoInterface>;
    warpGwBlock(): Promise<BlockData>;
    info(): Promise<NetworkInfoInterface>;
    gql(query: string, variables: GqlReqVariables): Promise<Partial<AxiosResponse<any>>>;
    tx(id: string): Promise<Transaction>;
    txData(id: string): Promise<Buffer>;
    txDataString(id: string): Promise<string>;
    private doFetchInfo;
}
//# sourceMappingURL=ArweaveWrapper.d.ts.map