import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
export declare type Wallet = {
    jwk: JWKInterface;
    address: string;
};
export declare class Testing {
    private readonly arweave;
    constructor(arweave: Arweave);
    mineBlock(): Promise<void>;
    generateWallet(): Promise<Wallet>;
    private addFunds;
    private validateEnv;
}
//# sourceMappingURL=Testing.d.ts.map