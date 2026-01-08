<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import ThemeSelector from '@/components/common/selectors/ThemeSelector.vue'
import LanguageSelector from '@/components/common/selectors/LanguageSelector.vue'
import DisplaySettings from '@/components/common/selectors/DisplaySettings.vue'
import AutoFetchIntervalSelector from '@/components/common/selectors/AutoFetchIntervalSelector.vue'

const { t } = useI18n()

// Modal visibility
const visible = defineModel<boolean>('visible', { default: false })
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('views.user_profile.preferences.title')"
        :style="{ width: '650px' }"
        :draggable="false"
    >
        <div class="space-y-8">
            <!-- Appearance Section -->
            <div>
                <h3 class="text-lg font-semibold text-surface-900 mb-1">
                    {{ t('views.user_profile.preferences.appearance.title') }}
                </h3>
                <p class="text-sm text-surface-500 mb-4">
                    {{ t('views.user_profile.preferences.appearance.description') }}
                </p>

                <div class="space-y-6">
                    <ThemeSelector />
                    <LanguageSelector />
                </div>
            </div>

            <Divider />

            <!-- Display Section -->
            <div>
                <h3 class="text-lg font-semibold text-surface-900 mb-1">
                    {{ t('views.user_profile.preferences.display.title') }}
                </h3>
                <p class="text-sm text-surface-500 mb-4">
                    {{ t('views.user_profile.preferences.display.description') }}
                </p>

                <div class="space-y-6">
                    <DisplaySettings />
                </div>
            </div>

            <Divider />

            <!-- Data Section -->
            <div>
                <h3 class="text-lg font-semibold text-surface-900 mb-1">
                    {{ t('views.user_profile.preferences.data.title') }}
                </h3>
                <p class="text-sm text-surface-500 mb-4">
                    {{ t('views.user_profile.preferences.data.description') }}
                </p>

                <div class="space-y-6">
                    <AutoFetchIntervalSelector />
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped></style>
