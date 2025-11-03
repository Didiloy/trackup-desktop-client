import { LogEntry, LogFormatter, LogLevel } from './types.js'
import { colorize, formatTimestamp, toMessage } from './utils.js'
import { LoggerConfigManager } from './config.js'

/**
 * Default formatter for log messages with color support
 */
export class DefaultLogFormatter implements LogFormatter {
  private config = LoggerConfigManager.getConfig()

  /**
   * Format log level with appropriate colors and consistent width
   */
  formatLevel(level: LogLevel): string {
    const levelUpper = level.toUpperCase() as
      | 'LOG'
      | 'WARN'
      | 'ERROR'
      | 'DEBUG'
      | 'VERBOSE'
      | 'INFO'
      | 'SUCCESS'

    switch (levelUpper) {
      case 'LOG':
        return colorize(this.config.useColors, 'blue', '[LOG]')
      case 'WARN':
        return colorize(this.config.useColors, 'yellow', '[WARN]')
      case 'ERROR':
        return colorize(this.config.useColors, 'red', '[ERROR]')
      case 'DEBUG':
        return colorize(this.config.useColors, 'magenta', '[DEBUG]')
      case 'VERBOSE':
        return colorize(this.config.useColors, 'dim', '[VERBOSE]')
      case 'INFO':
        return colorize(this.config.useColors, 'cyan', '[INFO]')
      case 'SUCCESS':
        return colorize(this.config.useColors, 'green', '[SUCCESS]')
      default:
        return `[${levelUpper}]`
    }
  }

  /**
   * Format context name with appropriate colors
   */
  formatContext(context: string): string {
    const upperCtx = context.toUpperCase()
    return colorize(this.config.useColors, 'brightBrown', `[${upperCtx}]`)
  }

  /**
   * Format timestamp
   */
  formatTimestamp(): string {
    return formatTimestamp()
  }

  /**
   * Format complete log message with proper alignment
   */
  formatMessage(entry: LogEntry): string {
    const time = this.formatTimestamp()
    const ctxRaw = entry.context || 'Application'
    const ctx = this.formatContext(ctxRaw)
    const lvl = this.formatLevel(entry.level)

    // Dynamic padding for alignment
    const levelText = entry.level.toUpperCase()
    const levelPadding = ' '.repeat(Math.max(0, this.config.maxLevelLength - levelText.length))

    const contextText = (entry.context || 'Application').toUpperCase()
    const contextLength = Math.max(this.config.maxContextLength, contextText.length)
    const contextPadding = ' '.repeat(Math.max(0, contextLength - contextText.length))

    const grayTime = colorize(this.config.useColors, 'gray', time)

    let line: string
    if (this.config.logOrder === 'context-first') {
      // time  [CONTEXT]   [LEVEL] message
      line = `${grayTime}  ${ctx}${contextPadding} ${lvl}${levelPadding} ${toMessage(entry.message)}`
    } else {
      // Default: time [LEVEL] [CONTEXT] message
      line = `${grayTime} ${lvl}${levelPadding} ${ctx}${contextPadding} ${toMessage(entry.message)}`
    }

    if (entry.optionalParams && entry.optionalParams.length > 0) {
      const rest = entry.optionalParams.map(toMessage).join(' ')
      line += ' ' + rest
    }

    return line
  }

  /**
   * Format error message with stack trace
   */
  formatError(entry: LogEntry): string {
    const header = this.formatMessage(entry)
    const stack =
      typeof entry.trace === 'string'
        ? entry.trace
        : entry.trace instanceof Error
          ? entry.trace.stack || entry.trace.message
          : typeof entry.trace === 'undefined'
            ? ''
            : toMessage(entry.trace)

    if (stack) {
      return header + '\n' + colorize(this.config.useColors, 'red', stack)
    }

    return header
  }
}

/**
 * JSON formatter for structured logging
 */
export class JsonLogFormatter implements LogFormatter {
  formatLevel(level: LogLevel): string {
    return level
  }

  formatContext(context: string): string {
    return context
  }

  formatTimestamp(): string {
    return new Date().toISOString()
  }

  formatMessage(entry: LogEntry): string {
    const logObject = {
      timestamp: this.formatTimestamp(),
      level: entry.level,
      context: entry.context || 'Application',
      message: toMessage(entry.message),
      ...(entry.optionalParams && entry.optionalParams.length > 0
        ? {
            params: entry.optionalParams.map(toMessage)
          }
        : {}),
      ...(entry.trace ? { trace: toMessage(entry.trace) } : {})
    }
    return JSON.stringify(logObject)
  }

  formatError(entry: LogEntry): string {
    return this.formatMessage(entry)
  }
}
