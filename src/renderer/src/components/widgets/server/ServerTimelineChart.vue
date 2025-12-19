<script setup lang="ts">
import { computed } from 'vue'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui'
import 'vue-data-ui/style.css'
import { useI18n } from 'vue-i18n'
import { useServerStatsStore } from '@/stores/server-stats'

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

const sortedData = computed(() => {
    const data = server_stats_store.getTimeline ?? []
    return [...data].sort((a, b) => {
        const dateA = new Date(a.period).getTime()
        const dateB = new Date(b.period).getTime()
        return dateA - dateB
    })
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
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm mb-6 h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-surface-900">
                {{ t('views.server_stats.activity_evolution', 'Activity Evolution') }}
            </h3>
        </div>

        <div v-if="server_stats_store.isLoading" class="h-[300px] flex items-center justify-center">
            <i class="pi pi-spin pi-spinner text-primary-500 text-3xl"></i>
        </div>

        <div v-else-if="hasData" :style="{ minHeight: `${height}px` }">
            <VueUiXy :dataset="dataset" :config="xyConfig" />
        </div>

        <div
            v-else
            class="h-[300px] rounded-md flex items-center justify-center text-sm text-surface-400"
        >
            {{ t('common.fields.none') }}
        </div>
    </div>
</template>
