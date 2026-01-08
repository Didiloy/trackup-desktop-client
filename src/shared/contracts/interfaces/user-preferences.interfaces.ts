/**
 * User preferences interfaces
 */

export interface IUserPreferences {
    theme: 'system' | 'light' | 'dark'
    language: string
    compactMode: boolean // Reduces spacing and sizes for more info density
    animationsEnabled: boolean // Enable/disable CSS transitions and animations
    autoFetchIntervalMinutes: number // Auto-fetch interval in minutes (5-10)
}

// Auto-fetch interval configuration
export const MIN_AUTO_FETCH_INTERVAL_MINUTES = 10
export const MAX_AUTO_FETCH_INTERVAL_MINUTES = 20

export const DEFAULT_USER_PREFERENCES: Readonly<IUserPreferences> = {
    theme: 'system',
    language: 'fr',
    compactMode: false,
    animationsEnabled: true,
    autoFetchIntervalMinutes: MIN_AUTO_FETCH_INTERVAL_MINUTES
} as const
