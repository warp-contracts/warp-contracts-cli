import { LoggerSettings, LogLevel } from '../LoggerSettings';
import { ILoggerFactory } from '../../logging/LoggerFactory';
import { WarpLogger } from '../../logging/WarpLogger';
export declare class ConsoleLoggerFactory implements ILoggerFactory {
    private registeredLoggers;
    private readonly registeredOptions;
    private defOptions;
    constructor();
    setOptions(newOptions: LoggerSettings, moduleName?: string): void;
    getOptions(moduleName?: string): LoggerSettings;
    logLevel(level: LogLevel, moduleName?: string): void;
    create(moduleName?: string): WarpLogger;
}
//# sourceMappingURL=ConsoleLoggerFactory.d.ts.map