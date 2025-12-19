<script setup lang="ts">
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import type {
    IActivityGrowthTrend,
    IActivityTimePatterns
} from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { computed } from 'vue'
import ActivitySparkline from '@/components/activities/detail/ActivitySparkline.vue'
import ActivityPatternsSummary from './ActivityPatternsSummary.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    timeline?: IStatsTimeline[] | null
    growth?: IActivityGrowthTrend | null
    patterns?: IActivityTimePatterns | null
}>()

const { t } = useI18n()

const growthBadge = computed(() => {
    const percent = props.growth?.growth_percent ?? 0
    const positive = percent >= 0
    return {
        text: `${positive ? '+' : ''}${percent.toFixed(1)}%`,
        positive
    }
})

const trendText = computed(() => {
    const raw = (props.growth?.trend || '').toString().toLowerCase()
    if (!raw) return t('views.activity.performance_section.trend_unknown')
    if (raw === 'up' || raw === 'increasing')
        return t('views.activity.performance_section.trend_up')
    if (raw === 'down' || raw === 'decreasing')
        return t('views.activity.performance_section.trend_down')
    if (raw === 'steady' || raw === 'stable')
        return t('views.activity.performance_section.trend_steady')
    return raw
})
</script>

<template>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.activity.performance_section.sessions_timeline') }}
                </p>
                <span
                    class="text-xs px-3 py-1 rounded-full"
                    :class="
                        growthBadge.positive
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-600'
                    "
                >
                    {{ growthBadge.text }}
                </span>
            </div>
            <ActivitySparkline :data="props.timeline ?? []" :height="120" />
        </div>

        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <p class="text-sm font-semibold text-surface-600 mb-4">
                {{ t('views.activity.performance_section.popularity') }}
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-surface-200 rounded-2xl p-4 ring-1 ring-surface-200/60">
                    <p class="text-lg font-semibold text-surface-900">
                        {{ trendText }}
                    </p>
                    <p class="text-xs text-surface-500 mt-1">
                        {{ t('views.activity.performance_section.growth') }}
                    </p>
                </div>
                <div class="bg-surface-200 rounded-2xl p-4 ring-1 ring-surface-200/60">
                    <p class="text-xs text-surface-500">
                        {{ t('views.activity.performance_section.weekly_sessions') }}
                    </p>
                    <p class="text-lg font-semibold text-surface-900">
                        {{ props.growth?.sessions_this_week ?? t('common.fields.none') }}
                    </p>
                    <p class="text-xs text-surface-500 mt-1">
                        {{ t('views.activity.performance_section.weekly_sessions_last_week') }}
                        {{ props.growth?.sessions_last_week ?? t('common.fields.none') }}
                    </p>
                </div>
            </div>
        </div>

        <ActivityPatternsSummary :patterns="patterns" />

        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <p class="text-sm font-semibold text-surface-600 mb-4">
                {{ t('views.activity.performance_section.growth') }}
            </p>
            <div
                class="text-5xl font-bold"
                :class="growthBadge.positive ? 'text-emerald-600' : 'text-red-600'"
            >
                {{ growthBadge.text }}
            </div>
        </div>
    </div>
</template>
