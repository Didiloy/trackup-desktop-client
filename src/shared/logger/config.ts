import { LoggerConfig, LogLevel } from './types.js'
import * as dotenv from 'dotenv'

/**
 * Configuration manager for logger settings
 */
export class LoggerConfigManager {
  private static config: LoggerConfig

  /**
   * Initialize logger configuration from environment variables
   */
  static initialize(): LoggerConfig {
    if (this.config) return this.config

    dotenv.config()

    const levels = this.parseLogLevels()
    const useColors = this.shouldUseColors()
    const orderEnv = (process.env.LOG_ORDER || '').toLowerCase()
    const logOrder: 'level-first' | 'context-first' =
      orderEnv === 'context-first' ? 'context-first' : 'level-first'

    this.config = {
      levels,
      useColors,
      maxContextLength: 20,
      maxLevelLength: 7, // 'VERBOSE' is the longest
      logOrder
    }

    return this.config
  }

  /**
   * Get current configuration
   */
  static getConfig(): LoggerConfig {
    return this.config || this.initialize()
  }

  /**
   * Update log levels configuration
   */
  static setLogLevels(levels: LogLevel[]): void {
    this.config = {
      ...this.getConfig(),
      levels: Array.from(new Set(levels))
    }
  }

  /**
   * Check if a log level is enabled
   */
  static isLevelEnabled(level: LogLevel): boolean {
    return this.getConfig().levels.includes(level)
  }

  /**
   * Parse log levels from environment variables
   */
  private static parseLogLevels(): LogLevel[] {
    const env = (process.env.LOG_LEVELS || '').trim()
    if (env) {
      const parts = env.split(',').map((s) => s.trim().toLowerCase()) as LogLevel[]
      return Array.from(new Set(parts)).filter(Boolean) as LogLevel[]
    }

    // Default levels depending on environment
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'PRODUCTION'
    return isProd
      ? ['log', 'warn', 'error', 'info']
      : ['log', 'warn', 'error', 'debug', 'verbose', 'info', 'success']
  }

  /**
   * Determine if colors should be used based on environment
   */
  private static shouldUseColors(): boolean {
    const noColor = (process.env.NO_COLOR || '').toLowerCase() === 'true'
    const forceColor = (process.env.FORCE_COLOR || '').length > 0
    const isTty = !!(process.stdout as any)?.isTTY
    return !noColor && (forceColor || isTty)
  }
}
