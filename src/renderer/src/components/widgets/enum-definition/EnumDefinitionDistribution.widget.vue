<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEnumDefinitionStatsStore } from '@/stores/enum-definition-stats'
import { VueUiDonut } from 'vue-data-ui'
import type { VueUiDonutConfig, VueUiDonutDatasetItem } from 'vue-data-ui'

const { t } = useI18n()
const store = useEnumDefinitionStatsStore()

const chartColors = [
    '#6366f1', // indigo
    '#22c55e', // green
    '#f59e0b', // amber
    '#ec4899', // pink
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#14b8a6', // teal
    '#f97316', // orange
    '#ef4444', // red
    '#06b6d4'  // cyan
]

// Must use 'values' array format as expected by VueUiDonut
const chartData = computed<VueUiDonutDatasetItem[]>(() => {
    if (!store.valueDistribution || !Array.isArray(store.valueDistribution)) {
        return []
    }
    return store.valueDistribution
        .slice(0, 10)
        .map((item, index) => ({
            name: item.selected_value || 'N/A',
            values: [item.usage_count || 0],
            color: chartColors[index % chartColors.length]
        }))
})

const config = computed<VueUiDonutConfig>(() => ({
    responsive: true,
    useBlurOnHover: true,
    userOptions: {
        show: false
    },
    style: {
        chart: {
            height: 280,
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            useGradient: true,
            backgroundColor: 'transparent',
            layout: {
                curvedMarkers: true,
                donut: {
                    useShadow: false,
                    radiusRatio: 0.35
                },
                labels: {
                    dataLabels: {
                        show: true,
                        hideUnderValue: 3
                    },
                    value: {
                        show: true
                    },
                    percentage: {
                        color: '#64748b',
                        bold: true
                    },
                    name: {
                        color: '#64748b'
                    },
                    hollow: {
                        show: true,
                        total: {
                            show: true,
                            bold: true,
                            color: '#64748b',
                            text: t('common.fields.total')
                        }
                    }
                }
            },
            legend: {
                show: true,
                backgroundColor: 'transparent',
                color: 'var(--surface-700)',
                showPercentage: false,
                showValue: false
            },
            tooltip: {
                show: true
            }
        }
    }
}))
</script>

<template>
    <div class="bg-surface-0 rounded-3xl p-6 shadow-sm ring-1 ring-surface-200/60 h-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <i class="pi pi-chart-pie text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('views.server_definitions.profile.distribution.title') }}
                </h3>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_definitions.profile.distribution.description') }}
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.isLoading" class="flex items-center justify-center h-64">
            <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!chartData.length"
            class="flex flex-col items-center justify-center h-64 text-surface-400"
        >
            <i class="pi pi-chart-pie text-4xl mb-3"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>

        <!-- Chart -->
        <div v-else class="flex justify-center h-64">
            <VueUiDonut :dataset="chartData" :config="config" />
        </div>
    </div>
</template>
