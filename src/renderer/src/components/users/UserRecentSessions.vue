<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useUserStatsStore } from '@/stores/user-stats'

const { t } = useI18n()
const user_stats_store = useUserStatsStore()
</script>

<template>
    <div class="bg-surface-0 rounded-2xl shadow-sm ring-1 ring-surface-200/60 p-6">
        <h2 class="text-xl font-bold text-surface-900 mb-4">
            {{ t('views.home.recent_sessions.title') }}
        </h2>

        <div v-if="user_stats_store.is_loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-16 bg-surface-100 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="user_stats_store.get_sessions.length === 0" class="text-center py-8 text-surface-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>{{ t('views.home.recent_sessions.empty') }}</p>
        </div>

        <div v-else class="space-y-2">
            <div
                v-for="session in user_stats_store.get_sessions"
                :key="session.id"
                class="flex items-center justify-between p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors"
            >
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-surface-900 truncate">
                        {{ session.activity_name }}
                    </p>
                    <p class="text-sm text-surface-500 truncate">
                        {{ session.server_name }}
                    </p>
                </div>
                <div class="flex items-center gap-4 ml-4">
                    <div class="text-right">
                        <p class="text-sm font-medium text-surface-900">
                            {{ formatMinutesToLabel(session.duration) }}
                        </p>
                        <p class="text-xs text-surface-500">
                            {{ new Date(session.date).toLocaleDateString() }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
