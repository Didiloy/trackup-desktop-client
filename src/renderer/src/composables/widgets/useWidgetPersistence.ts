/**
 * Atomic Composable: Widget Data Persistence
 * Responsibility: Directly interacting with localStorage for layout data.
 */
export function useWidgetPersistence() {
    function load<T>(key: string): T | null {
        try {
            const stored = localStorage.getItem(key)
            return stored ? (JSON.parse(stored) as T) : null
        } catch (error) {
            console.error(`Error loading key "${key}" from localStorage:`, error)
            return null
        }
    }

    function save<T>(key: string, data: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.error(`Error saving key "${key}" to localStorage:`, error)
        }
    }

    function remove(key: string): void {
        localStorage.removeItem(key)
    }

    return {
        load,
        save,
        remove
    }
}
