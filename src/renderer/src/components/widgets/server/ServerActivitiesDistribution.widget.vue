<script setup lang="ts">
import { computed } from 'vue'
import { VueUiDonut } from 'vue-data-ui'
import type { VueUiDonutConfig, VueUiDonutDatasetItem } from 'vue-data-ui'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStatsStore } from '@/stores/server-stats'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-activities-distribution',
        title_key: 'widgets.server.activities_distribution.title',
        icon: 'pi pi-chart-pie',
        description_key: 'widgets.server.activities_distribution.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()

const dataset = computed<VueUiDonutDatasetItem[]>(() => {
    const activities = server_stats_store.getDetails?.top_activities
    if (!activities) return []

    return activities.map((activity, index) => {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
        return {
            name: activity.activity_name,
            values: [activity.total_duration], // Use duration for distribution
            color: colors[index % colors.length]
        }
    })
})

const donutConfig = computed<VueUiDonutConfig>(() => ({
    responsive: true,
    useBlurOnHover: true,
    userOptions: {
        show: false
    },
    style: {
        chart: {
            height: 300,
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            useGradient: true,
            backgroundColor: 'transparent',
            layout: {
                curvedMarkers: true,
                donut: {
                    useShadow: false,
                    radiusRatio: 0.31
                },
                labels: {
                    dataLabels: {
                        show: true,
                        hideUnderValue: 3
                    },
                    value: {
                        show: true,
                        formatter: ({ value }) => {
                            return formatMinutesToLabel(value)
                        }
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
                            text: t('common.fields.total'),
                            value: {
                                color: '#64748b',
                                formatter: ({ value }) => {
                                    return formatMinutesToLabel(value)
                                }
                            }
                        },
                        average: {
                            show: true,
                            value: {
                                color: '#64748b',
                                formatter: ({ value }) => {
                                    return formatMinutesToLabel(value)
                                }
                            }
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
                show: true,
                customFormat: ({ datapoint }) => {
                    const content = `${datapoint?.name}: ${formatMinutesToLabel(datapoint?.value ?? 0)}`
                    return `<div style="background-color: var(--p-surface-0); color: var(--surface-900); padding: 4px 8px; border-radius: 8px; font-size: 12px; text-align: center; white-space: nowrap; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">${content}</div>`
                }
            }
        }
    }
}))
</script>

<template>
    <BaseWidgetContainer
        :title="t('views.server_stats.distribution', 'Activity Distribution')"
        :loading="server_stats_store.isLoading"
    >
        <div v-if="dataset.length > 0" class="flex justify-center h-full">
            <VueUiDonut :dataset="dataset" :config="donutConfig" />
        </div>

        <div v-else class="h-full flex items-center justify-center text-surface-400">
            {{ t('common.fields.none') }}
        </div>
    </BaseWidgetContainer>
</template>
