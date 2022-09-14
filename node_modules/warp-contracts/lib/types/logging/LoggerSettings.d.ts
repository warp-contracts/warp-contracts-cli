export declare const LogLevelOrder: {
    silly: number;
    trace: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
    fatal: number;
};
/**
 * Log level names (silly - fatal)
 * // FIXME: generate from LogLevelOrder with some TS trickery..
 */
export declare type LogLevel = 'silly' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LoggerSettings {
    minLevel: LogLevel;
}
export declare function lvlToOrder(logLevel: LogLevel): number;
//# sourceMappingURL=LoggerSettings.d.ts.map