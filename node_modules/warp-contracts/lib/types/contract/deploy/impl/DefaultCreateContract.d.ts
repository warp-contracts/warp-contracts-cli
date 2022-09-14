import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { Warp } from '../../../core/Warp';
import { CreateContract, ContractData, ContractDeploy, FromSrcTxContractData } from '../CreateContract';
export declare class DefaultCreateContract implements CreateContract {
    private readonly arweave;
    private warp;
    private readonly logger;
    constructor(arweave: Arweave, warp: Warp);
    deploy(contractData: ContractData, disableBundling?: boolean): Promise<ContractDeploy>;
    deployFromSourceTx(contractData: FromSrcTxContractData, disableBundling?: boolean, srcTx?: Transaction): Promise<ContractDeploy>;
    private post;
}
//# sourceMappingURL=DefaultCreateContract.d.ts.map