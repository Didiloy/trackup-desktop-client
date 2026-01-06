/**
 * User preferences interfaces
 */

export interface IUserPreferences {
    theme: 'system' | 'light' | 'dark'
    language: string
    // Optional future preferences
    notifications?: {
        enabled: boolean
        sound?: boolean
    }
    dateTimeFormat?: {
        use24Hour: boolean
        dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    }
    autoStartup?: boolean
    autoUpdates?: boolean
    analyticsConsent?: boolean
    compactMode?: boolean
}

export const DEFAULT_USER_PREFERENCES: Readonly<IUserPreferences> = {
    theme: 'system',
    language: 'fr',
    notifications: {
        enabled: true,
        sound: true
    },
    dateTimeFormat: {
        use24Hour: true,
        dateFormat: 'DD/MM/YYYY'
    },
    autoStartup: false,
    autoUpdates: true,
    analyticsConsent: false,
    compactMode: false
} as const
