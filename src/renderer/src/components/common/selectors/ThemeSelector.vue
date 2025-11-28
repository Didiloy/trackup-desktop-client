<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { applyTheme } from '@/utils'

type ThemeMode = 'system' | boolean

const THEME_STORAGE_KEY = 'theme-preference'

const is_dark_mode = ref<ThemeMode>(false)
const i18n = useI18n()

// Load theme from localStorage
const loadThemeFromStorage = (): ThemeMode => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored === 'system') return 'system'
        if (stored === 'true') return true
        if (stored === 'false') return false
        return 'system' // default to system
    } catch {
        return 'system'
    }
}

// Save theme to localStorage
const saveThemeToStorage = (theme: ThemeMode): void => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, String(theme))
    } catch (error) {
        console.error('Failed to save theme to localStorage:', error)
    }
}

// Add system theme option
const themeOptions = [
    {
        value: 'system' as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.system'),
        icon: 'desktop'
    },
    {
        value: false as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.light'),
        icon: 'sun'
    },
    {
        value: true as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.dark'),
        icon: 'moon'
    }
]

// Media query for system dark mode preference
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

// Check if the system prefers dark mode
const isSystemDarkMode = (): boolean => {
    return systemDarkMode.matches
}

// System theme change handler
const handleSystemThemeChange = (): void => {
    if (is_dark_mode.value === 'system') {
        applyTheme('system', isSystemDarkMode)
    }
}

onMounted(() => {
    // Load theme from localStorage
    is_dark_mode.value = loadThemeFromStorage()

    // Add system theme change listener
    systemDarkMode.addEventListener('change', handleSystemThemeChange)

    // Apply initial theme
    applyTheme(is_dark_mode.value, isSystemDarkMode)
})

onBeforeUnmount(() => {
    // Clean up event listener
    systemDarkMode.removeEventListener('change', handleSystemThemeChange)
})

// Watch for theme changes
watch(
    () => is_dark_mode.value,
    (newValue) => {
        applyTheme(newValue, isSystemDarkMode)
    }
)

// Function to handle theme change
const handleThemeChange = (event: { value: ThemeMode }): void => {
    // Update the theme value
    is_dark_mode.value = event.value

    // Save to localStorage
    saveThemeToStorage(event.value)

    // Apply the theme
    applyTheme(event.value, isSystemDarkMode)
}
</script>

<template>
    <div class="flex items-center justify-between gap-12">
        <h3>
            {{ i18n.t('views.user_profile.preferences.theme.title') }}
        </h3>
        <Select
            v-model="is_dark_mode"
            :options="themeOptions"
            option-label="name"
            option-value="value"
            class="w-full max-w-[135px]"
            @change="handleThemeChange"
        >
            <template #value="slotProps">
                <div class="flex items-center gap-2">
                    <font-awesome-icon
                        :icon="[
                            'fas',
                            slotProps.value === 'system'
                                ? 'desktop'
                                : slotProps.value
                                  ? 'moon'
                                  : 'sun'
                        ]"
                        class="text-lg transition-all duration-300 ease-in-out"
                    />
                    <span class="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {{
                            slotProps.value === 'system'
                                ? i18n.t('views.user_profile.preferences.theme.system')
                                : slotProps.value
                                  ? i18n.t('views.user_profile.preferences.theme.dark')
                                  : i18n.t('views.user_profile.preferences.theme.light')
                        }}
                    </span>
                </div>
            </template>
            <template #option="slotProps">
                <div class="flex items-center gap-2">
                    <font-awesome-icon
                        :icon="['fas', slotProps.option.icon]"
                        class="text-lg transition-all duration-300 ease-in-out"
                    />
                    <span class="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {{ slotProps.option.name }}
                    </span>
                </div>
            </template>
        </Select>
    </div>
</template>

<style scoped></style>
