import { LogLevel, LogOutput } from './types.js';

/**
 * Console output handler for log messages
 */
export class ConsoleOutput implements LogOutput {
  /**
   * Write log message to appropriate stream
   */
  write(message: string, level: LogLevel): void {
    const stream =
      level === 'error' ? process.stderr || process.stdout : process.stdout || process.stderr;

    stream.write(message + '\n');
  }
}

/**
 * File output handler for log messages
 */
export class FileOutput implements LogOutput {
  constructor(private filePath: string) {}

  write(message: string, level: LogLevel): void {
    // Implementation for file output would go here
    // For now, fallback to console
    const fs = require('fs');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} ${message}\n`;

    try {
      fs.appendFileSync(this.filePath, logEntry);
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
      new ConsoleOutput().write(message, level);
    }
  }
}

/**
 * Multi-output handler that can write to multiple destinations
 */
export class MultiOutput implements LogOutput {
  constructor(private outputs: LogOutput[]) {}

  write(message: string, level: LogLevel): void {
    this.outputs.forEach((output) => {
      try {
        output.write(message, level);
      } catch (error) {
        console.error('Error writing to output:', error);
      }
    });
  }

  addOutput(output: LogOutput): void {
    this.outputs.push(output);
  }

  removeOutput(output: LogOutput): void {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }
}
