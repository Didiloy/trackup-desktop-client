<script setup lang="ts">
import { computed } from 'vue'
import type { IStatsTimeline } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import 'vue-data-ui/style.css'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
    defineProps<{
        data?: IStatsTimeline[]
        height?: number
    }>(),
    {
        data: () => [],
        height: 100
    }
)

const { t } = useI18n()

// expose height for template use
const height = props.height

const sortedData = computed<IStatsTimeline[]>(() => {
    const data = props.data ?? []
    return [...data].sort((a, b) => {
        const dateA = new Date(a.period).getTime()
        const dateB = new Date(b.period).getTime()
        return dateA - dateB
    })
})

const periods = computed(() => sortedData.value.map((entry) => entry.period))

const dataset = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: t('views.activity.card.sessions'),
        type: 'line',
        smooth: true,
        useArea: true,
        color: '#4a84ff',
        series: sortedData.value.map((entry) => entry.sessions_count ?? 0)
    }
])

const xyConfig = computed<VueUiXyConfig>(() => ({
    responsive: true,
    chart: {
        backgroundColor: 'transparent',
        height: props.height,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        legend: { show: false },
        labels: { fontSize: 0 },
        grid: {
            showHorizontalLines: false,
            showVerticalLines: false,
            stroke: 'transparent',
            labels: {
                show: false,
                xAxisLabels: {
                    show: true,
                    values: periods.value
                },
                yAxis: {
                    showBaseline: false,
                    showCrosshairs: false
                },
                xAxis: { showBaseline: false, showCrosshairs: false }
            }
        },
        tooltip: {
            show: true
        },
        title: { show: false },
        userOptions: {
            show: false
        },
        bar: {
            borderRadius: 4
        }
    },
    line: {
        useGradient: true,
        strokeWidth: 2,
        dot: {
            useSerieColor: true,
            hideAboveMaxSerieLength: 1e3
        }
    }
}))

const hasData = computed(() => !!sortedData.value.length)
</script>

<template>
    <div v-if="hasData" :style="{ minHeight: `${height}px`, height: `${height}px` }">
        <VueUiXy :dataset="dataset" :config="xyConfig" />
    </div>
    <div
        v-else
        class="w-full h-16 rounded-md bg-surface-100 flex items-center justify-center text-xs text-surface-500"
    >
        {{ t('common.fields.none') }}
    </div>
</template>
