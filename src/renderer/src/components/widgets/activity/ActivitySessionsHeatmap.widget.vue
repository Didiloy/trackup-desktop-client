<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useActivityStatsStore } from '@/stores/activity-stats'
import { useServerStore } from '@/stores/server'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { EWidgetCategory } from '@shared/contracts/interfaces/widget.interfaces'

defineOptions({
    widgetMetadata: {
        id: 'activity-sessions-heatmap',
        title: 'Carte de Chaleur',
        icon: 'pi pi-table',
        description: 'Affiche la carte de chaleur des sessions',
        category: EWidgetCategory.Activity,
        defaultSize: { w: 12, h: 5, minW: 6, minH: 4 }
    }
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
    }>(),
    {
        showIdentity: true
    }
)

const { t } = useI18n()
const route = useRoute()
const activity_stats_store = useActivityStatsStore()
const server_store = useServerStore()

const activityId = computed(() => route.params.activityId as string)
const serverId = computed(() => server_store.getPublicId)

async function fetchHeatmapData(): Promise<void> {
    if (serverId.value && activityId.value) {
        await activity_stats_store.fetchHeatmapTimeline(serverId.value, activityId.value)
    }
}

onMounted(() => {
    fetchHeatmapData()
})

watch([serverId, activityId], () => {
    fetchHeatmapData()
})

const heatmapData = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = 7 * 52 // ~1 year
    const start = new Date(today)
    start.setDate(start.getDate() - (days - 1))

    const stats = new Map<string, { count: number; duration: number }>()
    for (const entry of activity_stats_store.getHeatmapTimeline) {
        const key = new Date(entry.period).toISOString().slice(0, 10)
        stats.set(key, {
            count: entry.sessions_count,
            duration: entry.total_duration
        })
    }

    const data: { date: Date; count: number; duration: number }[] = []
    const cursor = new Date(start)
    while (cursor <= today) {
        const key = cursor.toISOString().slice(0, 10)
        const entry = stats.get(key)
        data.push({
            date: new Date(cursor),
            count: entry?.count ?? 0,
            duration: entry?.duration ?? 0
        })
        cursor.setDate(cursor.getDate() + 1)
    }

    const weeks: { date: Date; count: number; duration: number }[][] = []
    for (let i = 0; i < data.length; i += 7) {
        weeks.push(data.slice(i, i + 7))
    }
    return weeks
})

function intensity(count: number): string {
    if (count === 0) return 'bg-primary-500/5'
    if (count === 1) return 'bg-primary-500/15'
    if (count === 2) return 'bg-primary-500/30'
    if (count <= 4) return 'bg-primary-500/50'
    if (count <= 6) return 'bg-primary-500/70'
    return 'bg-primary-500'
}

function tooltipFor(day: { date: Date; count: number; duration: number }): string {
    return `${day.date.toLocaleDateString()}: ${day.count} ${t('common.fields.items')} • ${formatMinutesToLabel(day.duration)}`
}
</script>

<template>
    <div class="relative rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm w-full">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.activity.performance_section.heatmap') }}
                </p>
                <ActivityIdentityCorner :show="props.showIdentity" class="static" />
            </div>
            <p class="text-xs text-surface-500">
                {{ t('views.activity.performance_section.last_year') }}
            </p>
        </div>

        <div
            v-if="activity_stats_store.isHeatmapLoading"
            class="h-[120px] flex items-center justify-center"
        >
            <i class="pi pi-spin pi-spinner text-primary-500 text-2xl"></i>
        </div>

        <div v-else class="w-full overflow-x-auto">
            <div class="grid grid-cols-52 gap-1 min-w-full">
                <div
                    v-for="(week, weekIndex) in heatmapData"
                    :key="weekIndex"
                    class="grid grid-rows-7 gap-1"
                >
                    <div
                        v-for="day in week"
                        :key="day.date.toISOString()"
                        class="w-full aspect-square rounded-sm transition-colors duration-200"
                        v-tooltip.bottom="tooltipFor(day)"
                        :class="intensity(day.count)"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>
