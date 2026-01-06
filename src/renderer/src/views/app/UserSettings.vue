<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ThemeSelector from '@/components/common/selectors/ThemeSelector.vue'
import LanguageSelector from '@/components/common/selectors/LanguageSelector.vue'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const user_store = useUserStore()

const goBack = () => {
    router.push({ name: 'Home' })
}
</script>

<template>
    <div class="min-h-screen bg-surface-50 p-6">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center gap-4 mb-6">
                <Button
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    text
                    @click="goBack"
                    v-tooltip.bottom="t('navigation.back')"
                />
                <div>
                    <h1 class="text-3xl font-bold text-surface-900">
                        {{ t('views.user_profile.preferences.title') }}
                    </h1>
                    <p class="text-sm text-surface-500 mt-1">
                        {{ user_store.getEmail }}
                    </p>
                </div>
            </div>

            <!-- Settings Sections -->
            <div class="space-y-6">
                <!-- Appearance Section -->
                <div class="bg-surface-0 rounded-2xl shadow-sm ring-1 ring-surface-200/60 p-6">
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-surface-900 mb-1">
                            {{ t('views.user_profile.preferences.appearance.title') }}
                        </h2>
                        <p class="text-sm text-surface-500">
                            {{ t('views.user_profile.preferences.appearance.description') }}
                        </p>
                    </div>

                    <div class="space-y-6">
                        <!-- Theme Selector -->
                        <ThemeSelector />

                        <!-- Language Selector -->
                        <LanguageSelector />
                    </div>
                </div>

                <!-- Future Settings Sections -->
                <!-- 
                <div class="bg-surface-0 rounded-2xl shadow-sm ring-1 ring-surface-200/60 p-6">
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold text-surface-900 mb-1">
                            Notifications
                        </h2>
                        <p class="text-sm text-surface-500">
                            Gérer vos préférences de notifications
                        </p>
                    </div>
                    <NotificationsSettings />
                </div>
                -->
            </div>
        </div>
    </div>
</template>

<style scoped></style>
