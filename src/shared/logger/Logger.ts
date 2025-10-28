import { ILogger, LogEntry, LogFormatter, LogLevel, LogOutput } from './types.js'
import { LoggerConfigManager } from './config.js'
import { DefaultLogFormatter } from './formatter.js'
import { ConsoleOutput, MultiOutput } from './output.js'

/**
 * Main Logger class with separated responsibilities
 */
export class Logger implements ILogger {
  private static formatter: LogFormatter = new DefaultLogFormatter()
  private static output: LogOutput = new ConsoleOutput()

  // Instance specific output (optional)
  private instanceOutput?: LogOutput
  private instanceExclusive = false // if true, only send to instance output

  /**
   * Create a new Logger instance with a specific context.
   */
  constructor(private context: string) {
    // Initialize configuration on first use
    LoggerConfigManager.initialize()
  }

  /**
   * Set custom formatter for all logger instances
   */
  static setFormatter(formatter: LogFormatter): void {
    this.formatter = formatter
  }

  /**
   * Set custom output for all logger instances
   */
  static setOutput(output: LogOutput): void {
    this.output = output
  }

  /**
   * Add (append) an additional output destination without losing existing ones.
   * If current output is already a MultiOutput, we append. Otherwise wrap.
   */
  static addOutput(output: LogOutput): void {
    if (this.output instanceof MultiOutput) {
      ;(this.output as MultiOutput).addOutput(output)
    } else {
      this.output = new MultiOutput([this.output, output])
    }
  }

  /**
   * Configure which log levels are enabled globally.
   */
  static setLogLevels(levels: LogLevel[]): void {
    LoggerConfigManager.setLogLevels(levels)
  }

  /**
   * Check if a specific log level is currently enabled.
   */
  static isLevelEnabled(level: LogLevel): boolean {
    return LoggerConfigManager.isLevelEnabled(level)
  }

  /**
   * Attach a per-instance output. If exclusive=true, this instance's messages won't go to the global outputs.
   */
  setInstanceOutput(output: LogOutput, exclusive: boolean = true) {
    this.instanceOutput = output
    this.instanceExclusive = exclusive
  }

  // Instance methods now handle per-instance outputs directly instead of delegating to static ones
  log(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('log', message, optionalParams)
  }

  error(message: unknown, trace?: unknown, context?: string): void {
    this.writeInstance('error', message, [], trace, context)
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('warn', message, optionalParams)
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('debug', message, optionalParams)
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('verbose', message, optionalParams)
  }

  info(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('info', message, optionalParams)
  }

  success(message: unknown, ...optionalParams: unknown[]): void {
    this.writeInstance('success', message, optionalParams)
  }

  private writeInstance(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[] = [],
    trace?: unknown,
    overrideContext?: string
  ) {
    if (!Logger.isLevelEnabled(level)) return
    const entry: LogEntry = {
      level,
      message,
      context: overrideContext || this.context || 'Application',
      timestamp: Logger.formatter.formatTimestamp(),
      optionalParams: optionalParams.length ? optionalParams : undefined,
      trace: level === 'error' ? trace : undefined
    }

    const formatted =
      level === 'error' && (Logger.formatter as any).formatError
        ? (Logger.formatter as any).formatError(entry)
        : Logger.formatter.formatMessage(entry)

    // If instance output set, write there (and optionally skip global)
    if (this.instanceOutput) {
      try {
        this.instanceOutput.write(formatted, level)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        /* swallow */
      }
      if (this.instanceExclusive) return // don't also write globally
    }

    // Fallback/global output
    Logger.output.write(formatted, level)
  }

  // Static methods retained for backwards compatibility / direct static usage
  static log(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('log')) return
    this.writeStatic('log', message, context, optionalParams)
  }

  static warn(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('warn')) return
    this.writeStatic('warn', message, context, optionalParams)
  }

  static debug(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('debug')) return
    this.writeStatic('debug', message, context, optionalParams)
  }

  static verbose(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('verbose')) return
    this.writeStatic('verbose', message, context, optionalParams)
  }

  static info(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('info')) return
    this.writeStatic('info', message, context, optionalParams)
  }

  static success(message: unknown, context: string, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled('success')) return
    this.writeStatic('success', message, context, optionalParams)
  }

  static error(message: unknown, trace?: unknown, context?: string): void {
    if (!this.isLevelEnabled('error')) return

    const entry: LogEntry = {
      level: 'error',
      message,
      context: context || 'Application',
      timestamp: this.formatter.formatTimestamp(),
      trace
    }

    const formattedMessage = (this.formatter as any).formatError
      ? (this.formatter as any).formatError(entry)
      : this.formatter.formatMessage(entry)

    this.output.write(formattedMessage, 'error')
  }

  private static writeStatic(
    level: LogLevel,
    message: unknown,
    context: string,
    optionalParams: unknown[] = []
  ) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: this.formatter.formatTimestamp(),
      optionalParams: optionalParams.length ? optionalParams : undefined
    }
    const formattedMessage = this.formatter.formatMessage(entry)
    this.output.write(formattedMessage, level)
  }
}
