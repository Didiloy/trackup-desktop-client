<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { EPeriod } from '@shared/contracts/enums/period.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-sessions-heatmap',
        title: 'Carte de Chaleur',
        icon: 'pi pi-table',
        description: 'Affiche la carte de chaleur des sessions',
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
        },
        defaultSize: { w: 12, h: 6, minW: 10, minH: 5 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()

const server_store = useServerStore()
const { getActivityStatsTimeline } = useActivityStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const serverId = computed(() => server_store.getPublicId)

const localTimeline = ref<IStatsTimeline[]>([])
const isLoadingLocal = ref(false)

async function fetchHeatmapData(): Promise<void> {
    if (!serverId.value || !activityId.value) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStatsTimeline(serverId.value, activityId.value, {
            period: EPeriod.DAILY,
            limit: 365
        })
        if (res.data) {
            localTimeline.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
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
    const timeline = localTimeline.value

    for (const entry of timeline) {
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
    <BaseWidgetContainer :loading="isLoadingLocal">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <p class="text-sm font-semibold text-surface-600">
                            {{ t('views.activity.performance_section.heatmap') }}
                        </p>
                        <ActivityIdentityCorner
                            :show="props.showIdentity"
                            class="static"
                            :activity-id="activityId"
                        />
                    </div>
                    <p class="text-xs text-surface-500">
                        {{ t('views.activity.performance_section.last_year') }}
                    </p>
                </div>
            </div>
        </template>

        <div class="w-full overflow-x-auto h-full">
            <div class="grid grid-cols-52 gap-1 min-w-full">
                <div
                    v-for="(week, weekIndex) in heatmapData"
                    :key="weekIndex"
                    class="grid grid-rows-7 gap-1"
                >
                    <div
                        v-for="day in week"
                        :key="day.date.toISOString()"
                        v-tooltip.bottom="tooltipFor(day)"
                        class="w-full aspect-square rounded-sm transition-colors duration-200"
                        :class="intensity(day.count)"
                    ></div>
                </div>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
