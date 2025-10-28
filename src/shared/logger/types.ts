/**
 * Available log levels for the Logger
 */
export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'info' | 'success';

/**
 * Color keys available for log formatting
 */
export type ColorKey =
  | 'reset'
  | 'dim'
  | 'gray'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'green'
  | 'cyan'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightGreen'
  | 'white'
  | 'brightRed'
  | 'brightYellow'
  | 'brightWhite'
  | 'brightGray'
  | 'brightBlack'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'brightTeal'
  | 'lightGray'
  | 'brown'
  | 'brightBrown';

/**
 * Log entry representing a single log message
 */
export interface LogEntry {
  level: LogLevel;
  message: unknown;
  context?: string;
  timestamp: string;
  optionalParams?: unknown[];
  trace?: unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  levels: LogLevel[];
  useColors: boolean;
  maxContextLength: number;
  maxLevelLength: number;
  /** Order of level/context in plain formatter: 'level-first' (default) or 'context-first' */
  logOrder?: 'level-first' | 'context-first';
}

/**
 * Interface for formatting log messages
 */
export interface LogFormatter {
  formatLevel(level: LogLevel): string;

  formatContext(context: string): string;

  formatTimestamp(): string;

  formatMessage(entry: LogEntry): string;
}

/**
 * Interface for outputting log messages
 */
export interface LogOutput {
  write(message: string, level: LogLevel): void;
}

/**
 * Interface for the main logger
 */
export interface ILogger {
  log(message: unknown, ...optionalParams: unknown[]): void;

  error(message: unknown, trace?: unknown, context?: string): void;

  warn(message: unknown, ...optionalParams: unknown[]): void;

  debug(message: unknown, ...optionalParams: unknown[]): void;

  verbose(message: unknown, ...optionalParams: unknown[]): void;

  info(message: unknown, ...optionalParams: unknown[]): void;

  success(message: unknown, ...optionalParams: unknown[]): void;
}

/**
 * Interface for static logger methods
 */
export interface IStaticLogger {
  log(message: unknown, context: string, ...optionalParams: unknown[]): void;

  error(message: unknown, trace?: unknown, context?: string): void;

  warn(message: unknown, context: string, ...optionalParams: unknown[]): void;

  debug(message: unknown, context: string, ...optionalParams: unknown[]): void;

  verbose(message: unknown, context: string, ...optionalParams: unknown[]): void;

  info(message: unknown, context: string, ...optionalParams: unknown[]): void;

  success(message: unknown, context: string, ...optionalParams: unknown[]): void;

  setLogLevels(levels: LogLevel[]): void;

  isLevelEnabled(level: LogLevel): boolean;
}
