<script setup lang="ts">
import type { IActivityTimePatterns } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    patterns?: IActivityTimePatterns | null
}>()

const { t } = useI18n()

const dayNames = computed(() => [
    t('common.weekdays.short.sunday'),
    t('common.weekdays.short.monday'),
    t('common.weekdays.short.tuesday'),
    t('common.weekdays.short.wednesday'),
    t('common.weekdays.short.thursday'),
    t('common.weekdays.short.friday'),
    t('common.weekdays.short.saturday')
])

function formatDay(value: number | null | undefined): string {
    if (value === null || value === undefined) return t('common.none')
    return dayNames.value[value] ?? t('common.none')
}

function formatHour(value: number | null | undefined): string {
    if (value === null || value === undefined) return t('common.none')
    const hours = Math.floor(value)
    return `${hours}h`
}

const cards = computed(() => {
    const p = props.patterns
    return [
        {
            label: t('userInterface.serverActivitiesView.ActivityPerformanceSection.peak_day'),
            value: formatDay(p?.peak_day_of_week)
        },
        {
            label: t('userInterface.serverActivitiesView.ActivityPerformanceSection.peak_hour'),
            value: formatHour(p?.peak_hour)
        },
        {
            label: t(
                'userInterface.serverActivitiesView.ActivityPerformanceSection.current_streak'
            ),
            value: `${p?.streak_current ?? 0} ${t('userInterface.serverActivitiesView.ActivityPerformanceSection.days')}`
        },
        {
            label: t(
                'userInterface.serverActivitiesView.ActivityPerformanceSection.longest_streak'
            ),
            value: `${p?.streak_longest ?? 0} ${t('userInterface.serverActivitiesView.ActivityPerformanceSection.days')}`
        },
        {
            label: t(
                'userInterface.serverActivitiesView.ActivityPerformanceSection.likes_per_session'
            ),
            value: (p?.likes_per_session ?? 0).toFixed(1)
        },
        {
            label: t(
                'userInterface.serverActivitiesView.ActivityPerformanceSection.unique_participants'
            ),
            value: (p?.unique_participants ?? 0).toLocaleString()
        }
    ]
})
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('userInterface.serverActivitiesView.ActivityPerformanceSection.patterns') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
                v-for="card in cards"
                :key="card.label"
                class="rounded-2xl bg-surface-0/80 p-4 ring-1 ring-surface-200/60"
            >
                <p class="text-xs text-surface-500">{{ card.label }}</p>
                <p class="text-lg font-semibold text-surface-900">{{ card.value }}</p>
            </div>
        </div>
    </div>
</template>
