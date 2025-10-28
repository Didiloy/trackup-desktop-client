// Re-export all public interfaces and interfaces
export type {
  LogLevel,
  ColorKey,
  LogEntry,
  LoggerConfig,
  LogFormatter,
  LogOutput,
  ILogger,
  IStaticLogger,
} from './types.js';

// Re-export main Logger class
export { Logger } from './Logger.js';

// Re-export configuration manager
export { LoggerConfigManager } from './config.js';

// Re-export formatters
export { DefaultLogFormatter, JsonLogFormatter } from './formatter.js';

// Re-export outputs
export { ConsoleOutput, FileOutput, MultiOutput } from './output.js';

// Re-export utilities
export { colorize, toMessage, formatTimestamp, COLORS } from './utils.js';

// For backward compatibility, export Logger as default
export { Logger as default } from './Logger.js';
