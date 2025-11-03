import { ColorKey } from './types.js'

/**
 * ANSI color codes for terminal output
 */
export const COLORS: Record<ColorKey, string> = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  gray: '\u001b[90m',
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  green: '\u001b[32m',
  cyan: '\u001b[36m',
  brightBlue: '\u001b[94m',
  brightMagenta: '\u001b[95m',
  brightCyan: '\u001b[96m',
  brightGreen: '\u001b[92m',
  white: '\u001b[37m',
  //| 'brightRed' | 'brightYellow' | 'brightWhite' | 'brightGray';
  brightRed: '\u001b[91m',
  brightYellow: '\u001b[93m',
  brightWhite: '\u001b[97m',
  brightGray: '\u001b[37;1m',
  brightBlack: '\u001b[37;1m',
  orange: '\u001b[38;2;255;165;0m', // Custom RGB color
  pink: '\u001b[38;2;255;192;203m', // Custom RGB color
  purple: '\u001b[38;2;128;0;128m', // Custom RGB color
  brown: '\u001b[38;2;165;42;42m', // Custom RGB color
  brightBrown: '\u001b[38;2;210;105;30m', // Custom RGB color
  lightGray: '\u001b[90m',
  brightTeal: '\u001b[38;2;64;224;208m' // Custom RGB color - turquoise
}

/**
 * Apply color to text if colors are enabled
 */
export function colorize(enabled: boolean, color: ColorKey, text: string): string {
  if (!enabled) return text
  return COLORS[color] + text + COLORS.reset
}

/**
 * Convert any value to a readable string message
 */
export function toMessage(val: unknown): string {
  if (typeof val === 'string') return val
  if (val instanceof Error) return val.message
  try {
    return JSON.stringify(val)
  } catch {
    return String(val)
  }
}

/**
 * Format timestamp in ISO-like format
 */
export function formatTimestamp(): string {
  const d = new Date()
  const iso = d.toISOString()
  return iso.replace('T', ' ').replace('Z', '') // 2025-09-25 12:34:56.789
}
