<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import 'vue-data-ui/style.css'
import { useI18n } from 'vue-i18n'
import { useServerStatsStore } from '@/stores/server-stats'
import { useServerStore } from '@/stores/server'
import { EPeriod } from '@shared/contracts/enums/period.enum'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import PeriodSelector from '@/components/common/selectors/PeriodSelector.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-timeline-chart',
        title_key: 'widgets.server.timeline.title',
        icon: 'pi pi-chart-line',
        description_key: 'widgets.server.timeline.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 6, h: 8, minW: 6, minH: 8 }
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        height?: number
    }>(),
    {
        height: 300
    }
)

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
const server_store = useServerStore()

const selectedPeriodType = ref<EPeriod | null>(EPeriod.ALL_TIME)
const period = ref<Date[] | null>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
])
const timelineData = ref<IStatsTimeline[]>([])
const isLoading = ref(false)

const getFilteredTimeline = computed<IStatsTimeline[]>(() => {
    if (!timelineData.value) return []

    // If no custom period is set, return the full timeline
    if (!period.value || period.value.length !== 2 || !period.value[0] || !period.value[1]) {
        return timelineData.value
    }

    const [start, end] = period.value
    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)

    return timelineData.value.filter((item) => {
        const itemDate = new Date(item.period)
        return itemDate >= startDate && itemDate <= endDate
    })
})

const sortedData = computed(() => {
    const data = getFilteredTimeline.value ?? []
    return [...data].sort((a, b) => {
        const dateA = new Date(a.period).getTime()
        const dateB = new Date(b.period).getTime()
        return dateA - dateB
    })
})

async function fetchTimeline(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId) return

    isLoading.value = true
    try {
        if (selectedPeriodType.value) {
            // Presets logic
            let limit = 365
            if (selectedPeriodType.value === EPeriod.DAILY) limit = 90

            const res = await server_stats_store.fetchTimeline(serverId, {
                period: selectedPeriodType.value,
                limit: limit
            })
            if ('data' in res && res.data) {
                timelineData.value = res.data
            }
        } else if (
            period.value &&
            period.value.length === 2 &&
            period.value[0] &&
            period.value[1]
        ) {
            // Custom range logic
            const now = new Date()
            const start = new Date(period.value[0])
            const diffMs = now.getTime() - start.getTime()
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

            let resolution = EPeriod.ALL_TIME
            let limit = diffDays + 1

            if (diffDays > 365) {
                resolution = EPeriod.WEEKLY
                limit = Math.ceil(diffDays / 7) + 1
            }

            if (resolution === EPeriod.WEEKLY && limit > 365) {
                resolution = EPeriod.MONTHLY
                limit = Math.ceil(diffDays / 30.44) + 1
            }

            limit = Math.min(limit, 365)

            const res = await server_stats_store.fetchTimeline(serverId, {
                period: resolution,
                limit: limit
            })
            if ('data' in res && res.data) {
                timelineData.value = res.data
            }
        }
    } finally {
        isLoading.value = false
    }
}

watch(selectedPeriodType, (newType) => {
    if (newType) {
        period.value = null
        fetchTimeline()
    }
})

watch(period, (newPeriod) => {
    if (newPeriod && newPeriod.length === 2 && newPeriod[0] && newPeriod[1]) {
        fetchTimeline()
    }
})

watch(
    () => server_store.getPublicId,
    (id) => {
        if (id) fetchTimeline()
    }
)

onMounted(() => {
    if (server_store.getPublicId) {
        fetchTimeline()
    }
})

const periods = computed(() =>
    sortedData.value.map((entry) => {
        const date = new Date(entry.period)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    })
)

const dataset = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: t('views.server_stats.sessions', 'Sessions'),
        type: 'line',
        smooth: true,
        useArea: true,
        color: '#6366f1', // Primary-500ish
        series: sortedData.value.map((entry) => entry.sessions_count ?? 0)
    },
    {
        name: t('views.server_stats.unique_members', 'Unique Members'),
        type: 'bar',
        color: '#10b981', // Emerald-500
        series: sortedData.value.map((entry) => entry.unique_members ?? 0)
    }
])

const xyConfig = computed<VueUiXyConfig>(() => ({
    responsive: true,
    chart: {
        backgroundColor: 'transparent',
        height: props.height,
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        legend: {
            show: true,
            color: '#64748b'
        },
        labels: { fontSize: 12, color: '#64748b' },
        grid: {
            showHorizontalLines: true,
            showVerticalLines: false,
            stroke: '#e2e8f0',
            labels: {
                show: true,
                color: '#64748b',
                xAxisLabels: {
                    show: true,
                    values: periods.value,
                    rotation: -45
                }
            }
        },
        tooltip: {
            show: true,
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: 12,
            borderRadius: 8,
            borderColor: '#e2e8f0',
            showPercentage: false
        },
        title: { show: false },
        userOptions: {
            show: false
        }
    },
    bar: {
        borderRadius: 4,
        useGradient: true
    },
    line: {
        useGradient: true,
        strokeWidth: 3,
        dot: {
            useSerieColor: true,
            radius: 4
        }
    }
}))

const hasData = computed(() => !!sortedData.value.length)
</script>

<template>
    <BaseWidgetContainer :loading="isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div
                    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <h3 class="text-lg font-bold text-surface-900">
                        {{ t('views.server_stats.activity_evolution') }}
                    </h3>

                    <PeriodSelector
                        v-model:period="period"
                        v-model:selected-period-type="selectedPeriodType"
                    />
                </div>
            </div>
        </template>

        <div v-if="hasData" class="h-full">
            <VueUiXy :dataset="dataset" :config="xyConfig" />
        </div>

        <div
            v-else
            class="h-full rounded-md flex items-center justify-center text-sm text-surface-400"
        >
            {{ t('common.fields.none') }}
        </div>
    </BaseWidgetContainer>
</template>
