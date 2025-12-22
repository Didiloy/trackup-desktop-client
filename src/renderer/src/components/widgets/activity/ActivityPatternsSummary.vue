<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'

import ActivityIdentityCorner from '@/components/widgets/activity/ActivityIdentityCorner.vue'

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
    }>(),
    {
        showIdentity: true
    }
)

const { t } = useI18n()
const activity_stats_store = useActivityStatsStore()

const patternsData = computed(() => activity_stats_store.getDetails?.time_patterns)

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

const cards = computed(() => {
    const p = patternsData.value
    return [
        {
            label: t('views.activity.performance_section.peak_day'),
            value: formatDay(p?.peak_day_of_week)
        },
        {
            icon: 'pi pi-clock',
            label: t('views.activity.performance_section.peak_hour'),
            value:
                p?.peak_hour !== null && p?.peak_hour !== undefined
                    ? `${p.peak_hour}h`
                    : t('common.fields.none'),
            color: 'text-violet-500',
            bg: 'bg-violet-100'
        },
        {
            icon: 'pi pi-hourglass',
            label: t('views.activity.performance_section.avg_session_hours'),
            value:
                p?.avg_session_hours !== undefined
                    ? `${p.avg_session_hours.toFixed(1)}h`
                    : t('common.fields.none'),
            color: 'text-pink-500',
            bg: 'bg-pink-100'
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
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <ActivityIdentityCorner :show="props.showIdentity" />
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
