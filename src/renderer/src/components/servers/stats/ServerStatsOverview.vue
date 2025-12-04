<script setup lang="ts">
import type { IServerStats } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'

const props = defineProps<{
    stats: IServerStats | undefined
    loading?: boolean
}>()

const { t } = useI18n()

const cards = computed(() => {
    if (!props.stats) return []

    return [
        {
            label: t('views.server_stats.total_sessions', 'Total Sessions'),
            value: props.stats.total_sessions.toLocaleString(),
            icon: 'pi pi-calendar',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: t('views.server_stats.active_members', 'Active Members'),
            value: props.stats.active_members.toLocaleString(),
            subValue: `/ ${props.stats.total_members} ${t('common.fields.total')}`,
            icon: 'pi pi-users',
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: t('views.server_stats.total_duration', 'Total Duration'),
            value: formatMinutesToLabel(props.stats.total_duration),
            icon: 'pi pi-clock',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: t('views.server_stats.total_activities', 'Activities'),
            value: props.stats.total_activities.toLocaleString(),
            icon: 'pi pi-bolt',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            label: t('views.server_stats.engagement_score', 'Engagement Score'),
            value: props.stats.engagement_score.toFixed(1),
            icon: 'pi pi-chart-line',
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
        {
            label: t('views.server_stats.avg_likes_per_session', 'Avg Likes/Session'),
            value: props.stats.avg_likes_per_session.toFixed(2),
            icon: 'pi pi-thumbs-up',
            color: 'text-pink-500',
            bg: 'bg-pink-500/10'
        },
        {
            label: t('views.server_stats.avg_participants_per_session', 'Avg Participants'),
            value: props.stats.avg_participants_per_session.toFixed(2),
            icon: 'pi pi-user-plus',
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10'
        }
    ]
})
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        <template v-if="loading || !stats">
            <div
                v-for="i in 7"
                :key="i"
                class="h-32 rounded-2xl bg-surface-100 animate-pulse"
            ></div>
        </template>
        <template v-else>
            <div
                v-for="(card, index) in cards"
                :key="index"
                class="p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm hover:shadow-md transition-shadow"
            >
                <div class="flex items-start justify-between mb-4">
                    <div :class="`p-3 rounded-xl ${card.bg} ${card.color}`">
                        <i :class="card.icon" class="text-xl"></i>
                    </div>
                </div>
                <div>
                    <p class="text-sm text-surface-500 font-medium mb-1">
                        {{ card.label }}
                    </p>
                    <h3 class="text-2xl font-bold text-surface-900">
                        {{ card.value }}
                    </h3>
                    <p v-if="card.subValue" class="text-xs text-surface-400 mt-1">
                        {{ card.subValue }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>
