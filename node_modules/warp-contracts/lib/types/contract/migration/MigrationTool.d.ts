import Arweave from 'arweave';
import { EvalStateResult } from '../../core/modules/StateEvaluator';
import { LevelDbCache } from '../../cache/impl/LevelDbCache';
export declare type MigrationResult = Array<{
    contractTxId: string;
    height: number;
    sortKey: string;
}>;
export declare class MigrationTool {
    private readonly arweave;
    private readonly levelDb;
    private readonly logger;
    private readonly sorter;
    constructor(arweave: Arweave, levelDb: LevelDbCache<EvalStateResult<unknown>>);
    migrateSqlite(sqlitePath: string): Promise<MigrationResult>;
}
//# sourceMappingURL=MigrationTool.d.ts.map