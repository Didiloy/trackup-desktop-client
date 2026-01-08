<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Slider from 'primevue/slider'
import { useUserPreferencesStore } from '@/stores/user-preferences'
import {
    MIN_AUTO_FETCH_INTERVAL_MINUTES,
    MAX_AUTO_FETCH_INTERVAL_MINUTES
} from '@shared/contracts/interfaces/user-preferences.interfaces'

const { t } = useI18n()
const userPreferencesStore = useUserPreferencesStore()

const autoFetchInterval = computed({
    get: () => userPreferencesStore.getAutoFetchIntervalMinutes,
    set: (value: number) => userPreferencesStore.setAutoFetchIntervalMinutes(value)
})
</script>

<template>
    <div class="flex items-center justify-between gap-6">
        <!-- Label with Description -->
        <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-900 whitespace-nowrap">
                {{ t('views.user_profile.preferences.data.auto_fetch_interval.label') }}
            </label>
            <p class="text-xs text-surface-500">
                {{ t('views.user_profile.preferences.data.auto_fetch_interval.description') }}
            </p>
        </div>

        <div class="flex items-center gap-2 ml-auto">
            <!-- Slider -->
            <Slider
                v-model="autoFetchInterval"
                :min="MIN_AUTO_FETCH_INTERVAL_MINUTES"
                :max="MAX_AUTO_FETCH_INTERVAL_MINUTES"
                :step="1"
                class="w-20"
            />

            <!-- Value Display -->
            <div class="text-sm text-surface-600 font-medium whitespace-nowrap min-w-20 text-right">
                {{
                    t('views.user_profile.preferences.data.auto_fetch_interval.minutes', {
                        n: autoFetchInterval
                    })
                }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
