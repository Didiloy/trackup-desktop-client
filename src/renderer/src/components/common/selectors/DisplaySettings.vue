<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserPreferencesStore } from '@/stores/user-preferences'
import InputSwitch from 'primevue/inputswitch'

const { t } = useI18n()
const preferencesStore = useUserPreferencesStore()

const compactMode = computed({
    get: () => preferencesStore.getCompactMode,
    set: (value: boolean) => preferencesStore.setCompactMode(value)
})

const animationsEnabled = computed({
    get: () => preferencesStore.getAnimationsEnabled,
    set: (value: boolean) => preferencesStore.setAnimationsEnabled(value)
})
</script>

<template>
    <div class="space-y-6">
        <!-- Compact Mode -->
        <div class="flex items-center justify-between gap-12">
            <div class="flex-1">
                <h3 class="font-medium">{{ t('views.user_profile.preferences.display.compact_mode.title') }}</h3>
                <p class="text-sm text-surface-500 mt-1">
                    {{ t('views.user_profile.preferences.display.compact_mode.description') }}
                </p>
            </div>
            <InputSwitch v-model="compactMode" />
        </div>

        <!-- Animations -->
        <div class="flex items-center justify-between gap-12">
            <div class="flex-1">
                <h3 class="font-medium">{{ t('views.user_profile.preferences.display.animations.title') }}</h3>
                <p class="text-sm text-surface-500 mt-1">
                    {{ t('views.user_profile.preferences.display.animations.description') }}
                </p>
            </div>
            <InputSwitch v-model="animationsEnabled" />
        </div>
    </div>
</template>

<style scoped></style>
