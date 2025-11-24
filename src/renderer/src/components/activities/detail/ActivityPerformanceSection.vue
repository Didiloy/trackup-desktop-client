<script setup lang="ts">
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import type {
    IActivityGrowthTrend,
    IActivityTimePatterns
} from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { computed } from 'vue'
import ActivitySparkline from '@/components/activities/ActivitySparkline.vue'
import ActivityPatternsSummary from './ActivityPatternsSummary.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    timeline?: IStatsTimeline[] | null
    growth?: IActivityGrowthTrend | null
    patterns?: IActivityTimePatterns | null
    skillLevels?: IActivitySkillLevel[]
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

const skillDistribution = computed(() => {
    if (!props.skillLevels?.length) return []
    const maxOrder = Math.max(...props.skillLevels.map((lvl) => lvl.display_order ?? 1))
    return props.skillLevels.map((lvl) => ({
        name: lvl.name,
        color: lvl.color || '#64748b',
        ratio: ((lvl.display_order ?? 1) / Math.max(maxOrder, 1)) * 100 //TODO CHANGER CECI PAR UN VRAI RATIO
    }))
})
</script>

<template>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-semibold text-surface-600">
                    {{
                        t(
                            'userInterface.serverActivitiesView.ActivityPerformanceSection.sessions_timeline'
                        )
                    }}
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
                {{ t('userInterface.serverActivitiesView.ActivityPerformanceSection.popularity') }}
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-surface-200 rounded-2xl p-4 ring-1 ring-surface-200/60">
                    <p class="text-lg font-semibold text-surface-900">
                        {{ props.growth?.trend ?? '—' }}
                    </p>
                    <p class="text-xs text-surface-500 mt-1">
                        {{
                            t(
                                'userInterface.serverActivitiesView.ActivityPerformanceSection.growth'
                            )
                        }}
                    </p>
                </div>
                <div class="bg-surface-200 rounded-2xl p-4 ring-1 ring-surface-200/60">
                    <p class="text-xs text-surface-500">
                        {{
                            t(
                                'userInterface.serverActivitiesView.ActivityPerformanceSection.weekly_sessions'
                            )
                        }}
                    </p>
                    <p class="text-lg font-semibold text-surface-900">
                        {{ props.growth?.sessions_this_week ?? '—' }}
                    </p>
                    <p class="text-xs text-surface-500 mt-1">
                        {{
                            t(
                                'userInterface.serverActivitiesView.ActivityPerformanceSection.weekly_sessions_last_week'
                            )
                        }}
                        {{ props.growth?.sessions_last_week ?? '—' }}
                    </p>
                </div>
            </div>
            <div class="mt-6">
                <p class="text-xs text-surface-500 mb-2">
                    {{
                        t(
                            'userInterface.serverActivitiesView.ActivityPerformanceSection.skillLevels'
                        )
                    }}
                </p>
                <div class="space-y-2">
                    <div
                        v-for="lvl in skillDistribution"
                        :key="lvl.name"
                        class="flex items-center gap-3"
                    >
                        <span
                            class="text-xs text-surface-500 w-20 truncate"
                            v-tooltip.top="lvl.name"
                            >{{ lvl.name }}</span
                        >
                        <div class="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
                            <div
                                v-tooltip.top="lvl.ratio + '%'"
                                class="h-full rounded-full transition-all duration-300"
                                :style="{ width: `${lvl.ratio}%`, background: lvl.color }"
                            ></div>
                        </div>
                    </div>
                    <div v-if="!skillDistribution.length" class="text-xs text-surface-400">
                        {{ t('common.none') }}
                    </div>
                </div>
            </div>
        </div>

        <ActivityPatternsSummary :patterns="patterns" />

        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <p class="text-sm font-semibold text-surface-600 mb-4">
                {{ t('userInterface.serverActivitiesView.ActivityPerformanceSection.growth') }}
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
