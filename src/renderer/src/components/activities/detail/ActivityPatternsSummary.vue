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
    if (value === null || value === undefined) return t('common.fields.none')
    return dayNames.value[value] ?? t('common.fields.none')
}

function formatHour(value: number | null | undefined): string {
    if (value === null || value === undefined) return t('common.fields.none')
    const hours = Math.floor(value)
    return `${hours}h`
}

const cards = computed(() => {
    const p = props.patterns
    return [
        {
            label: t('views.activity.performance_section.peak_day'),
            value: formatDay(p?.peak_day_of_week)
        },
        {
            label: t('views.activity.performance_section.peak_hour'),
            value: formatHour(p?.peak_hour)
        },
        {
            label: t('views.activity.performance_section.current_streak'),
            value: `${p?.streak_current ?? 0} ${t('views.activity.performance_section.days')}`
        },
        {
            label: t('views.activity.performance_section.longest_streak'),
            value: `${p?.streak_longest ?? 0} ${t('views.activity.performance_section.days')}`
        },
        {
            label: t('views.activity.performance_section.likes_per_session'),
            value: (p?.likes_per_session ?? 0).toFixed(1)
        },
        {
            label: t('views.activity.performance_section.unique_participants'),
            value: (p?.unique_participants ?? 0).toLocaleString()
        }
    ]
})
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <p class="text-sm font-semibold text-surface-600 mb-4">
            {{ t('views.activity.performance_section.patterns') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
                v-for="card in cards"
                :key="card.label"
                class="rounded-2xl bg-surface-200/80 p-4 ring-1 ring-surface-200/60"
            >
                <p class="text-xs text-surface-500">{{ card.label }}</p>
                <p class="text-lg font-semibold text-surface-900">{{ card.value }}</p>
            </div>
        </div>
    </div>
</template>
