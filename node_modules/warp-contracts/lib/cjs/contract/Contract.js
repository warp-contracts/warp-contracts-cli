"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractError = void 0;
class ContractError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ContractError';
    }
}
exports.ContractError = ContractError;
//# sourceMappingURL=Contract.js.map