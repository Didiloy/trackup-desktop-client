import { BrowserWindow } from 'electron'

/**
 * WindowManager
 * Centralized registry for managing all application windows
 */
export class WindowManager {
    private windows: Map<string, BrowserWindow> = new Map()

    /**
     * Register a window with a unique identifier
     */
    register(id: string, window: BrowserWindow): void {
        this.windows.set(id, window)

        window.on('closed', () => {
            this.windows.delete(id)
        })
    }

    /**
     * Get a window by its identifier
     */
    get(id: string): BrowserWindow | undefined {
        return this.windows.get(id)
    }

    /**
     * Get the main window
     */
    getMain(): BrowserWindow | undefined {
        return this.windows.get('main')
    }

    /**
     * Get all registered windows
     */
    all(): BrowserWindow[] {
        return Array.from(this.windows.values())
    }

    /**
     * Check if a window exists
     */
    has(id: string): boolean {
        return this.windows.has(id)
    }

    /**
     * Focus a window or create it if it doesn't exist
     */
    async focusOrCreate(
        id: string,
        createFn: () => Promise<Electron.CrossProcessExports.BrowserWindow>
    ): Promise<Electron.CrossProcessExports.BrowserWindow> {
        const existing = this.windows.get(id)
        if (existing && !existing.isDestroyed()) {
            if (existing.isMinimized()) {
                existing.restore()
            }
            existing.focus()
            return existing
        }

        const newWindow = createFn()
        this.register(id, await newWindow)
        return newWindow
    }

    /**
     * Close all windows
     */
    closeAll(): void {
        this.windows.forEach((window) => {
            if (!window.isDestroyed()) {
                window.close()
            }
        })
        this.windows.clear()
    }

    /**
     * Dispose of all windows
     */
    dispose(): void {
        this.closeAll()
    }
}

// Singleton instance
export const windowManager = new WindowManager()
