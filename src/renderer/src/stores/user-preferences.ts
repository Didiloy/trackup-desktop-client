import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import type {
    IUserPreferences
} from '@shared/contracts/interfaces/user-preferences.interfaces'
import { DEFAULT_USER_PREFERENCES } from '@shared/contracts/interfaces/user-preferences.interfaces'
import { applyTheme } from '@/utils'
import { setI18nLanguage } from '@/i18n'

const PREFERENCES_STORAGE_KEY = 'user-preferences'

/**
 * User preferences store - Centralized management of user preferences
 * Persists to localStorage and provides reactive getters/setters
 */
export const useUserPreferencesStore = defineStore('user-preferences', () => {
    // State
    const preferences = reactive<IUserPreferences>({ ...DEFAULT_USER_PREFERENCES })

    // Load preferences from localStorage
    const loadPreferences = (): void => {
        try {
            const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<IUserPreferences>
                Object.assign(preferences, { ...DEFAULT_USER_PREFERENCES, ...parsed })
            }
        } catch (error) {
            console.error('Failed to load user preferences from localStorage:', error)
        }
    }

    // Save preferences to localStorage
    const savePreferences = (): void => {
        try {
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
        } catch (error) {
            console.error('Failed to save user preferences to localStorage:', error)
        }
    }

    // Getters
    const getTheme = computed(() => preferences.theme)
    const getLanguage = computed(() => preferences.language)
    const getNotifications = computed(() => preferences.notifications)
    const getDateTimeFormat = computed(() => preferences.dateTimeFormat)
    const getAutoStartup = computed(() => preferences.autoStartup)
    const getAutoUpdates = computed(() => preferences.autoUpdates)
    const getAnalyticsConsent = computed(() => preferences.analyticsConsent)
    const getCompactMode = computed(() => preferences.compactMode)

    // Actions
    const setTheme = (theme: 'system' | 'light' | 'dark'): void => {
        preferences.theme = theme
        savePreferences()

        // Apply theme to DOM
        const isSystemDarkMode = (): boolean => {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme(theme, isSystemDarkMode)
    }

    const setLanguage = async (language: string): Promise<boolean> => {
        try {
            const result = await setI18nLanguage(language)
            if (result) {
                preferences.language = language
                savePreferences()
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to set language:', error)
            return false
        }
    }

    const setNotificationsEnabled = (enabled: boolean): void => {
        if (!preferences.notifications) {
            preferences.notifications = { enabled, sound: true }
        } else {
            preferences.notifications.enabled = enabled
        }
        savePreferences()
    }

    const setNotificationsSound = (sound: boolean): void => {
        if (!preferences.notifications) {
            preferences.notifications = { enabled: true, sound }
        } else {
            preferences.notifications.sound = sound
        }
        savePreferences()
    }

    const setDateTimeFormat = (
        format: Partial<{ use24Hour: boolean; dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' }>
    ): void => {
        preferences.dateTimeFormat = {
            ...preferences.dateTimeFormat,
            ...format
        } as IUserPreferences['dateTimeFormat']
        savePreferences()
    }

    const setAutoStartup = (enabled: boolean): void => {
        preferences.autoStartup = enabled
        savePreferences()
    }

    const setAutoUpdates = (enabled: boolean): void => {
        preferences.autoUpdates = enabled
        savePreferences()
    }

    const setAnalyticsConsent = (consent: boolean): void => {
        preferences.analyticsConsent = consent
        savePreferences()
    }

    const setCompactMode = (enabled: boolean): void => {
        preferences.compactMode = enabled
        savePreferences()
    }

    // Initialize on store creation
    loadPreferences()

    // Apply initial theme and language
    const isSystemDarkMode = (): boolean => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme(preferences.theme, isSystemDarkMode)
    setI18nLanguage(preferences.language)

    // Watch for system theme changes when using 'system' theme
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (): void => {
        if (preferences.theme === 'system') {
            applyTheme('system', isSystemDarkMode)
        }
    }
    systemDarkMode.addEventListener('change', handleSystemThemeChange)

    return {
        // State
        preferences,

        // Getters
        getTheme,
        getLanguage,
        getNotifications,
        getDateTimeFormat,
        getAutoStartup,
        getAutoUpdates,
        getAnalyticsConsent,
        getCompactMode,

        // Actions
        setTheme,
        setLanguage,
        setNotificationsEnabled,
        setNotificationsSound,
        setDateTimeFormat,
        setAutoStartup,
        setAutoUpdates,
        setAnalyticsConsent,
        setCompactMode,
        loadPreferences,
        savePreferences
    }
})
