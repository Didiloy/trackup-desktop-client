<script setup lang="ts">
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    activity: IActivity | null
    stats: IActivityStatsDetails | null
}>()

const emit = defineEmits<{
    (e: 'edit'): void
    (e: 'delete'): void
}>()

const { t } = useI18n()

const summaryMetrics = computed(() => {
    if (!props.stats) {
        return []
    }
    return [
        {
            label: t('userInterface.serverActivitiesView.card.sessions'),
            value: props.stats.total_sessions.toLocaleString()
        },
        {
            label: t('userInterface.serverActivitiesView.card.duration'),
            value: `${Math.round(props.stats.total_duration / 60)}h`
        },
        {
            label: t('userInterface.serverActivitiesView.card.unique_participants'),
            value: props.stats.unique_participants.toLocaleString()
        }
    ]
})
</script>

<template>
    <div
        class="relative rounded-3xl p-6 mb-6 overflow-hidden ring-1 ring-surface-200/40 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-surface-0"
    >
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_60%)]"></div>
        <div class="relative z-10 flex flex-wrap items-center gap-6">
            <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold bg-surface-0/70 text-primary-600 ring-1 ring-white/50 shadow-lg overflow-hidden"
            >
                <img
                    v-if="activity?.logo"
                    :src="activity.logo"
                    :alt="activity.name"
                    class="w-full h-full object-cover"
                />
                <span v-else>{{ activity?.name?.charAt(0)?.toUpperCase() }}</span>
            </div>

            <div class="flex-1 min-w-[220px]">
                <p class="text-xs uppercase tracking-widest text-white/80 font-semibold">
                    {{ t('userInterface.serverActivitiesView.title') }}
                </p>
                <h1 class="text-3xl font-bold text-white drop-shadow-sm">
                    {{ activity?.name || '—' }}
                </h1>
                <p class="text-sm text-white/80 mt-1 max-w-2xl line-clamp-2">
                    {{ activity?.description || t('common.description') }}
                </p>
            </div>

            <div class="flex flex-wrap gap-3">
                <Button
                    icon="pi pi-pencil"
                    :label="t('actions.edit')"
                    severity="secondary"
                    class="shadow"
                    @click="emit('edit')"
                />
                <Button
                    icon="pi pi-trash"
                    :label="t('actions.delete')"
                    severity="danger"
                    class="shadow"
                    @click="emit('delete')"
                />
            </div>
        </div>

        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div
                v-for="metric in summaryMetrics"
                :key="metric.label"
                class="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-white/40 p-4 shadow-inner flex flex-col"
            >
                <span class="text-xs text-surface-500">{{ metric.label }}</span>
                <span class="text-2xl font-semibold text-surface-900">{{ metric.value }}</span>
            </div>
        </div>
    </div>
</template>


