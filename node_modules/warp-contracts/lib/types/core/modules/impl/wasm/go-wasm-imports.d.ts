import { SmartWeaveGlobal } from '../../../../legacy/smartweave-global';
export declare class Go {
    private _callbackTimeouts;
    private _nextCallbackTimeoutID;
    private _inst;
    private _values;
    private _ids;
    private _idPool;
    private _goRefCounts;
    importObject: any;
    private exited;
    private _resolveCallbackPromise;
    private _pendingEvent;
    private _id;
    exports: any;
    constructor(swGlobal: SmartWeaveGlobal);
    run(instance: any): Promise<void>;
    _resume(): void;
    _makeFuncWrapper(id: any): () => any;
    private _resolveExitPromise;
}
//# sourceMappingURL=go-wasm-imports.d.ts.map