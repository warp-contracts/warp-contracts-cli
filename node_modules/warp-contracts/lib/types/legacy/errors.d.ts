export declare const enum SmartWeaveErrorType {
    CONTRACT_NOT_FOUND = "CONTRACT_NOT_FOUND"
}
export declare class SmartWeaveError extends Error {
    readonly type: SmartWeaveErrorType;
    readonly otherInfo: any;
    constructor(type: SmartWeaveErrorType, optional?: {
        message?: string;
        requestedTxId?: string;
    });
    getType(): SmartWeaveErrorType;
}
//# sourceMappingURL=errors.d.ts.map