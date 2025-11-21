<script setup lang="ts">
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    stats: IActivityStatsDetails | null
}>()

const { t } = useI18n()

const cards = computed(() => {
    if (!props.stats) return []
    return [
        {
            label: t('userInterface.serverActivitiesView.card.duration'),
            value: `${Math.round(props.stats.total_duration / 60)}h`,
            description: t('userInterface.serverActivitiesView.card.avg_duration', {
                value: `${Math.round(props.stats.avg_duration / 60)}m`
            }),
            icon: 'pi pi-clock',
            gradient: 'bg-linear-to-br from-primary-500/20 via-primary-500/10 to-transparent'
        },
        {
            label: t('userInterface.serverActivitiesView.card.popularity'),
            value: props.stats.popularity_score.toFixed(0),
            description: t('userInterface.serverActivitiesView.card.sessions'),
            icon: 'pi pi-bolt',
            gradient: 'bg-linear-to-br from-amber-500/20 via-amber-500/10 to-transparent'
        },
        {
            label: t('userInterface.serverActivitiesView.card.total_participants'),
            value: props.stats.total_participants.toLocaleString(),
            description: '',
            subvalue: '',
            icon: 'pi pi-users',
            gradient: 'bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-transparent'
        }
    ]
})
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
            v-for="card in cards"
            :key="card.label"
            class="rounded-2xl bg-surface-100 ring-1 ring-surface-200/50 p-4 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:ring-primary-500/40"
            :class="card.gradient"
            >
            <div class="flex items-center justify-between">
                <p class="text-xs uppercase tracking-wide text-surface-500 font-semibold">
                    {{ card.label }}
                </p>
                <span
                    class="w-10 h-10 rounded-2xl bg-surface-0 flex items-center justify-center text-primary-500 shadow-inner"
                >
                    <i :class="card.icon"></i>
                </span>
            </div>
            <div class="mt-3 text-3xl font-semibold text-surface-900">{{ card.value }}</div>
            <div class="mt-1 text-sm text-surface-500">
                {{ card.description }}
                <span v-if="card.subvalue" class="font-semibold text-surface-800 ml-1">
                    {{ card.subvalue }}
                </span>
            </div>
        </div>
    </div>
</template>
