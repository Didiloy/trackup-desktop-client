<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { useUserPreferencesStore } from '@/stores/user-preferences'

type ThemeMode = 'system' | 'light' | 'dark'

const i18n = useI18n()
const preferencesStore = useUserPreferencesStore()

// Get current theme from store
const currentTheme = computed(() => preferencesStore.getTheme)

// Theme options
const themeOptions = [
    {
        value: 'system' as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.system'),
        icon: 'desktop'
    },
    {
        value: 'light' as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.light'),
        icon: 'sun'
    },
    {
        value: 'dark' as ThemeMode,
        name: i18n.t('views.user_profile.preferences.theme.dark'),
        icon: 'moon'
    }
]

// Function to handle theme change
const handleThemeChange = (event: { value: ThemeMode }): void => {
    preferencesStore.setTheme(event.value)
}
</script>

<template>
    <div class="flex items-center justify-between gap-12">
        <h3>
            {{ i18n.t('views.user_profile.preferences.theme.title') }}
        </h3>
        <Select
            :model-value="currentTheme"
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
                                : slotProps.value === 'dark'
                                  ? 'moon'
                                  : 'sun'
                        ]"
                        class="text-lg transition-all duration-300 ease-in-out"
                    />
                    <span class="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {{
                            slotProps.value === 'system'
                                ? i18n.t('views.user_profile.preferences.theme.system')
                                : slotProps.value === 'dark'
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
