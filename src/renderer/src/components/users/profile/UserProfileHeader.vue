<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/auth/useAuth'
import type { IUserStats } from '@shared/contracts/interfaces/entities-stats/user-stats.interfaces'

defineProps<{
    email?: string
    stats?: IUserStats | null
    loading?: boolean
}>()

const { t } = useI18n()
const { signOut } = useAuth()
</script>

<template>
    <div class="bg-surface-0 rounded-2xl shadow-sm ring-1 ring-surface-200/60 p-6 mb-6">
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <h1 class="text-3xl font-bold text-surface-900 mb-2">
                    {{ t('views.home.welcome') }}
                </h1>
                <p v-if="email" class="text-surface-600">
                    {{ email }}
                </p>
            </div>
            <div class="flex items-center gap-3">
                <Button
                    :label="t('common.misc.settings')"
                    icon="pi pi-cog"
                    severity="secondary"
                    outlined
                />
                <Button
                    :label="t('views.login.logout_button')"
                    icon="pi pi-sign-out"
                    severity="secondary"
                    @click="signOut"
                />
            </div>
        </div>

        <div v-if="stats && !loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="text-center p-3 bg-surface-50 rounded-xl">
                <p class="text-sm text-surface-500 mb-1">{{ t('views.home.stats.servers') }}</p>
                <p class="text-2xl font-bold text-surface-900">
                    {{ stats.total_servers_joined }}
                </p>
            </div>
            <div class="text-center p-3 bg-surface-50 rounded-xl">
                <p class="text-sm text-surface-500 mb-1">{{ t('views.home.stats.sessions') }}</p>
                <p class="text-2xl font-bold text-surface-900">
                    {{ stats.total_sessions }}
                </p>
            </div>
            <div class="text-center p-3 bg-surface-50 rounded-xl">
                <p class="text-sm text-surface-500 mb-1">{{ t('views.home.stats.activities') }}</p>
                <p class="text-2xl font-bold text-surface-900">
                    {{ stats.total_activities_created }}
                </p>
            </div>
            <div class="text-center p-3 bg-surface-50 rounded-xl">
                <p class="text-sm text-surface-500 mb-1">{{ t('views.home.stats.likes') }}</p>
                <p class="text-2xl font-bold text-surface-900">
                    {{ stats.total_likes_received }}
                </p>
            </div>
        </div>
    </div>
</template>
