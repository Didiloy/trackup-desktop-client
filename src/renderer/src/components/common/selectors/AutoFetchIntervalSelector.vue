<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Slider from 'primevue/slider'
import { useUserPreferencesStore } from '@/stores/user-preferences'

const { t } = useI18n()
const userPreferencesStore = useUserPreferencesStore()

const autoFetchInterval = computed({
    get: () => userPreferencesStore.getAutoFetchIntervalMinutes,
    set: (value: number) => userPreferencesStore.setAutoFetchIntervalMinutes(value)
})
</script>

<template>
    <div class="flex flex-col gap-3">
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <label class="text-sm font-medium text-surface-900 block mb-1">
                    {{ t('views.user_profile.preferences.data.auto_fetch_interval.label') }}
                </label>
                <p class="text-sm text-surface-500">
                    {{ t('views.user_profile.preferences.data.auto_fetch_interval.description') }}
                </p>
            </div>
        </div>
        
        <div class="flex flex-col gap-2">
            <Slider 
                v-model="autoFetchInterval" 
                :min="5" 
                :max="10" 
                :step="1"
                class="w-full"
            />
            <div class="text-sm text-surface-600 text-center font-medium">
                {{ t('views.user_profile.preferences.data.auto_fetch_interval.minutes', { n: autoFetchInterval }) }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
