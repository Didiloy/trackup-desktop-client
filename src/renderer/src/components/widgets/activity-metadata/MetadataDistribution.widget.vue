<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionStatsCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionStatsCRUD'
import ActivityMetadataIdentityCorner from '@/components/activities/profile/ActivityMetadataIdentityCorner.vue'
import { VueUiDonut } from 'vue-data-ui'
import type { VueUiDonutConfig, VueUiDonutDatasetItem } from 'vue-data-ui'
import type {
    IWidgetMetadata,
    IActivityMetadataWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type {
    IMetadataDistributionDto,
    IMetadataValueItemDto
} from '@shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'
import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { getTranslatedMetadataTypes, isMetadataTypeSupported } from '@/utils/metadata.utils'

defineOptions({
    widgetMetadata: {
        id: 'activity-metadata-distribution',
        title_key: 'widgets.activity_metadata.distribution.title',
        icon: 'pi pi-chart-pie',
        description_key: 'widgets.activity_metadata.distribution.description',
        category: {
            key: EWidgetCategory.ActivityMetadata,
            label_key: 'widgets.categories.activity_metadata'
        },
        defaultSize: { w: 4, h: 6, minW: 3, minH: 5 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityMetadataWidgetConfig
        metadataDefinitionId?: string
    }>(),
    {
        showIdentity: true,
        config: undefined,
        metadataDefinitionId: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMetadataValueStatsDistribution } = useActivityMetadataDefinitionStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const definitionId = computed(
    () => props.metadataDefinitionId || props.config?.metadataDefinitionId
)
const distributionData = ref<IMetadataDistributionDto | null>(null)
const distribution = ref<IMetadataValueItemDto[]>([])
const isLoadingLocal = ref(false)

// Only show for STRING and BOOLEAN types
const SUPPORTED_TYPES: ActivityMetadataType[] = ['STRING', 'BOOLEAN']

const isTypeCompatible = computed(() => {
    if (!distributionData.value) return true
    return isMetadataTypeSupported(distributionData.value.metadata_type, SUPPORTED_TYPES)
})

const translatedSupportedTypes = computed(() => {
    return getTranslatedMetadataTypes(SUPPORTED_TYPES, t)
})

async function fetchDistribution(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId || !activityId.value) return

    isLoadingLocal.value = true
    try {
        const res = await getMetadataValueStatsDistribution(
            serverId,
            activityId.value,
            definitionId.value
        )
        if (res.data) {
            distributionData.value = res.data
            if (res.data.values && Array.isArray(res.data.values)) {
                distribution.value = res.data.values
            }
        }
    } catch (error) {
        // Handle empty response or JSON parse errors gracefully
        console.warn('Failed to fetch metadata distribution:', error)
        distribution.value = []
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchDistribution()
})

watch(
    () => [server_store.getPublicId, definitionId.value, activityId.value],
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

const chartData = computed<VueUiDonutDatasetItem[]>(() => {
    if (!distribution.value || !Array.isArray(distribution.value)) {
        return []
    }
    return distribution.value.slice(0, 10).map((item, index) => ({
        name: item.value || 'N/A',
        values: [item.count || 0],
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
    <div class="relative bg-surface-0 rounded-3xl p-6 shadow-sm ring-1 ring-surface-200/60 h-full">
        <ActivityMetadataIdentityCorner
            :show="props.showIdentity"
            :activity-id="activityId"
            :metadata-definition-id="definitionId"
        />
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
            <div
                class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center"
            >
                <i class="pi pi-chart-pie text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('widgets.activity_metadata.distribution.title') }}
                </h3>
                <p class="text-sm text-surface-500">
                    {{ t('widgets.activity_metadata.distribution.description') }}
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
            <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
        </div>

        <!-- Incompatible Type Warning -->
        <div
            v-else-if="!isTypeCompatible"
            class="flex flex-col items-center justify-center h-64 text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200"
        >
            <i class="pi pi-exclamation-triangle text-amber-500 text-3xl mb-3"></i>
            <p class="text-sm text-center font-medium">
                {{ t('widgets.activity_metadata.incompatible_type') }}
            </p>
            <p class="text-xs text-surface-400 mt-1">
                {{ t('widgets.activity_metadata.supported_types', { types: translatedSupportedTypes }) }}
            </p>
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
        <div v-else class="flex justify-center h-80">
            <VueUiDonut :dataset="chartData" :config="config" />
        </div>
    </div>
</template>
