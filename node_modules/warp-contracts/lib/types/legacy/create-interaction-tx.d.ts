import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { BlockData } from 'arweave/node/blocks';
import { GQLNodeInterface, GQLTagInterface } from './gqlResult';
import { SigningFunction } from '../contract/Contract';
export declare function createInteractionTx(arweave: Arweave, signer: SigningFunction, contractId: string, input: any, tags: {
    name: string;
    value: string;
}[], target?: string, winstonQty?: string, dummy?: boolean, reward?: string): Promise<Transaction>;
export declare function createDummyTx(tx: Transaction, from: string, block: BlockData): GQLNodeInterface;
export declare function unpackTags(tx: Transaction): GQLTagInterface[];
//# sourceMappingURL=create-interaction-tx.d.ts.map