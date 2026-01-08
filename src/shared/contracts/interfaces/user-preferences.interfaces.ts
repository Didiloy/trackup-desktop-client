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

export const DEFAULT_USER_PREFERENCES: Readonly<IUserPreferences> = {
    theme: 'system',
    language: 'fr',
    compactMode: false,
    animationsEnabled: true,
    autoFetchIntervalMinutes: 5
} as const
