export declare const sleep: (ms: number) => Promise<void>;
export declare const deepCopy: (input: unknown, useFastCopy?: boolean) => any;
export declare const mapReplacer: (key: unknown, value: unknown) => unknown;
export declare const mapReviver: (key: unknown, value: any) => any;
export declare const asc: (a: number, b: number) => number;
export declare const ascS: (a: string, b: string) => number;
export declare const desc: (a: number, b: number) => number;
export declare const descS: (a: string, b: string) => number;
export declare function timeout(s: number): {
    timeoutId: number;
    timeoutPromise: Promise<any>;
};
export declare function stripTrailingSlash(str: string): string;
export declare function indent(callDepth: number): string;
//# sourceMappingURL=utils.d.ts.map