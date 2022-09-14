"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationTool = void 0;
const LexicographicalInteractionsSorter_1 = require("../../core/modules/impl/LexicographicalInteractionsSorter");
const StateEvaluator_1 = require("../../core/modules/StateEvaluator");
const knex_1 = __importDefault(require("knex"));
const LoggerFactory_1 = require("../../logging/LoggerFactory");
class MigrationTool {
    constructor(arweave, levelDb) {
        this.arweave = arweave;
        this.levelDb = levelDb;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('MigrationTool');
        this.sorter = new LexicographicalInteractionsSorter_1.LexicographicalInteractionsSorter(arweave);
    }
    async migrateSqlite(sqlitePath) {
        this.logger.info(`Migrating from sqlite ${sqlitePath} to leveldb.`);
        const knexDb = (0, knex_1.default)({
            client: 'sqlite3',
            connection: {
                filename: sqlitePath
            },
            useNullAsDefault: true
        });
        const cache = await knexDb
            .select(['contract_id', 'height', 'state'])
            .from('states')
            .max('height')
            .groupBy(['contract_id']);
        this.logger.info(`Migrating ${cache === null || cache === void 0 ? void 0 : cache.length} contracts' state`);
        const result = [];
        for (const entry of cache) {
            const contractTxId = entry['contract_id'];
            const height = entry['height'];
            const state = JSON.parse(entry['state']);
            const sortKey = this.sorter.generateLastSortKey(parseInt(height));
            this.logger.debug(`Migrating ${contractTxId} at height ${height}: ${sortKey}`);
            await this.levelDb.put({
                contractTxId,
                sortKey
            }, new StateEvaluator_1.EvalStateResult(state.state, state.validity, {}));
            result.push({ contractTxId, height, sortKey });
        }
        this.logger.info(`Migration done.`);
        return result;
    }
}
exports.MigrationTool = MigrationTool;
//# sourceMappingURL=MigrationTool.js.map