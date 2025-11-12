import { ConsoleOutput, FileOutput, JsonLogFormatter, Logger, MultiOutput } from '../index.js'

/**
 * Example demonstrating the new modular logger system
 */
export class LoggerExample {
    private logger = new Logger(this.constructor.name)

    /**
     * Basic usage examples
     */
    basicUsage(): void {
        // Instance methods (with context from constructor)
        this.logger.log('This is a log message')
        this.logger.warn('This is a warning')
        this.logger.error('This is an error', new Error('Sample error'))
        this.logger.debug('Debug information')
        this.logger.verbose('Verbose details')

        // Static methods (context as parameter)
        Logger.log('Static log message', 'ExampleContext')
        Logger.warn('Static warning', 'ExampleContext')
        Logger.error('Static error', new Error('Static error'), 'ExampleContext')
    }

    /**
     * Demonstrate configuration changes
     */
    configurationExample(): void {
        // Enable only specific log levels
        Logger.setLogLevels(['log', 'error'])

        this.logger.log('This will be shown')
        this.logger.debug('This will NOT be shown (debug disabled)')

        // Check if level is enabled
        if (Logger.isLevelEnabled('debug')) {
            this.logger.debug('Debug is enabled')
        }
    }

    /**
     * Demonstrate custom formatters
     */
    customFormatterExample(): void {
        // Switch to JSON formatter
        Logger.setFormatter(new JsonLogFormatter())

        this.logger.log('This will be formatted as JSON', { key: 'value' })

        // Switch back to default formatter
        const { DefaultLogFormatter } = require('../index.js')
        Logger.setFormatter(new DefaultLogFormatter())
    }

    /**
     * Demonstrate multiple outputs
     */
    multipleOutputExample(): void {
        // Create multiple outputs
        const consoleOut = new ConsoleOutput()
        const fileOut = new FileOutput('./logs/app.log')
        const multiOut = new MultiOutput([consoleOut, fileOut])

        // Set multi-output
        Logger.setOutput(multiOut)

        this.logger.log('This will go to both console and file')

        // Add another output dynamically
        const debugFileOut = new FileOutput('./logs/debug.log')
        multiOut.addOutput(debugFileOut)

        this.logger.debug('This goes to console + 2 files')
    }
}

// Example usage
const example = new LoggerExample()
example.basicUsage()
example.configurationExample()
example.customFormatterExample()
