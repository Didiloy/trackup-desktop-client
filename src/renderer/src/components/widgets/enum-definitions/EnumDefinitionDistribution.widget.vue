<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useEnumDefinitionStatsCRUD } from '@/composables/enum-definitions/useEnumDefinitionStatsCRUD'
import EnumDefinitionIdentityCorner from '@/components/enum-definitions/profile/EnumDefinitionIdentityCorner.vue'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { VueUiDonut } from 'vue-data-ui'
import type { VueUiDonutConfig, VueUiDonutDatasetItem } from 'vue-data-ui'
import type {
    IWidgetMetadata,
    IEnumDefinitionWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IEnumValueDistribution } from '@shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'enum-definitions-distribution',
        title_key: 'widgets.enum_definition.distribution.title',
        icon: 'pi pi-chart-pie',
        description_key: 'widgets.enum_definition.distribution.description',
        category: {
            key: EWidgetCategory.EnumDefinition,
            label_key: 'widgets.categories.enum_definition'
        },
        defaultSize: { w: 4, h: 6, minW: 4, minH: 6 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IEnumDefinitionWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getEnumValueStatsDistribution } = useEnumDefinitionStatsCRUD()

const definitionId = computed(
    () => (route.params.enumDefinitionId as string) || props.config?.enumDefinitionId
)
const distribution = ref<IEnumValueDistribution[]>([])
const isLoadingLocal = ref(false)

async function fetchDistribution(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getEnumValueStatsDistribution(serverId, definitionId.value)
        if (res.data && Array.isArray(res.data)) {
            distribution.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchDistribution()
})

watch(
    () => [server_store.getPublicId, definitionId.value],
    () => {
        void fetchDistribution()
    }
)

const loading = computed(() => isLoadingLocal.value)

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
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#a855f7' // purple
]

// Must use 'values' array format as expected by VueUiDonut
const chartData = computed<VueUiDonutDatasetItem[]>(() => {
    if (!distribution.value || !Array.isArray(distribution.value)) {
        return []
    }
    return distribution.value.slice(0, 10).map((item, index) => ({
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
                showValue: false,
                position: 'top'
            },
            tooltip: {
                show: true
            }
        }
    }
}))
</script>

<template>
    <BaseWidgetContainer :loading="loading">
        <template #header>
            <div class="pt-2 pb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div>
                            <h3 class="text-lg font-bold text-surface-900">
                                {{ t('views.server_enum_definitions.profile.distribution.title') }}
                            </h3>
                            <p class="text-xs text-surface-500 mt-1">
                                {{
                                    t(
                                        'views.server_enum_definitions.profile.distribution.description'
                                    )
                                }}
                            </p>
                        </div>
                        <EnumDefinitionIdentityCorner
                            :show="props.showIdentity"
                            class="static ml-5"
                            :definition-id="definitionId"
                        />
                    </div>
                </div>
            </div>
        </template>

        <!-- Empty State -->
        <div
            v-if="!chartData.length"
            class="flex flex-col items-center justify-center h-64 text-surface-400"
        >
            <i class="pi pi-chart-pie text-4xl mb-3"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>

        <!-- Chart -->
        <div v-else class="flex justify-center h-80">
            <VueUiDonut :dataset="chartData" :config="config" />
        </div>
    </BaseWidgetContainer>
</template>
