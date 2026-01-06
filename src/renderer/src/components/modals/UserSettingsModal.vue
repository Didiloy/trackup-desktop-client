<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import ThemeSelector from '@/components/common/selectors/ThemeSelector.vue'
import LanguageSelector from '@/components/common/selectors/LanguageSelector.vue'

const { t } = useI18n()

// Modal visibility
const visible = defineModel<boolean>('visible', { default: false })
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('views.user_profile.preferences.title')"
        :style="{ width: '600px' }"
        :draggable="false"
    >
        <div class="space-y-6">
            <!-- Appearance Section -->
            <div>
                <h3 class="text-lg font-semibold text-surface-900 mb-1">
                    {{ t('views.user_profile.preferences.appearance.title') }}
                </h3>
                <p class="text-sm text-surface-500 mb-4">
                    {{ t('views.user_profile.preferences.appearance.description') }}
                </p>

                <div class="space-y-6">
                    <!-- Theme Selector -->
                    <ThemeSelector />

                    <!-- Language Selector -->
                    <LanguageSelector />
                </div>
            </div>

            <!-- Future sections can be added here -->
        </div>
    </Dialog>
</template>

<style scoped></style>
