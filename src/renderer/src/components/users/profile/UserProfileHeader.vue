<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/auth/useAuth'
import { useUserStatsStore } from '@/stores/user-stats'
import { formatSecondsToLabel } from '@/utils/time.utils'

defineProps<{
    email?: string
}>()

const { t } = useI18n()
const { signOut } = useAuth()
const user_stats_store = useUserStatsStore()

const refreshStats = async () => {
    await user_stats_store.force_refresh()
}
</script>

<template>
    <div class="bg-surface-0 rounded-2xl shadow-sm ring-1 ring-surface-200/60 p-6 mb-6">
        <div class="flex items-start justify-between mb-6">
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
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    :loading="user_stats_store.is_loading"
                    @click="refreshStats"
                    v-tooltip.bottom="t('common.actions.refresh')"
                />
                <Button
                    :label="t('views.login.logout_button')"
                    icon="pi pi-sign-out"
                    severity="secondary"
                    @click="signOut"
                />
            </div>
        </div>

        <!-- Header Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                <div class="p-3 bg-indigo-500/10 rounded-lg">
                    <i class="pi pi-sign-in text-indigo-500 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-surface-500 mb-0.5">{{ t('views.home.stats.servers_joined') }}</p>
                    <p class="text-xl font-bold text-surface-900">
                        {{ user_stats_store.get_stats?.total_servers_joined.toLocaleString() ?? '0' }}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                <div class="p-3 bg-purple-500/10 rounded-lg">
                    <i class="pi pi-users text-purple-500 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-surface-500 mb-0.5">{{ t('views.home.stats.servers_created') }}</p>
                    <p class="text-xl font-bold text-surface-900">
                        {{ user_stats_store.get_stats?.total_servers_created.toLocaleString() ?? '0' }}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                <div class="p-3 bg-teal-500/10 rounded-lg">
                    <i class="pi pi-desktop text-teal-500 text-xl"></i>
                </div>
                <div>
                    <p class="text-sm text-surface-500 mb-0.5">{{ t('views.home.stats.app_time') }}</p>
                    <p class="text-xl font-bold text-surface-900">
                        {{ user_stats_store.get_stats ? formatSecondsToLabel(user_stats_store.get_real_time_app_seconds) : '0s' }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
