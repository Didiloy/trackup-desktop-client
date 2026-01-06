<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionStatsCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionStatsCRUD'
import ActivityMetadataIdentityCorner from '@/components/activities/profile/ActivityMetadataIdentityCorner.vue'
import type {
    IWidgetMetadata,
    IActivityMetadataWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type {
    IMetadataDefinitionSummaryDto,
    IMetadataDefinitionDetailDto,
    INumericSummary
} from '@shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'
import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { getTranslatedMetadataTypes, isMetadataTypeSupported } from '@/utils/metadata.utils'

defineOptions({
    widgetMetadata: {
        id: 'activity-metadata-numeric-summary',
        title_key: 'widgets.activity_metadata.numeric_summary.title',
        icon: 'pi pi-calculator',
        description_key: 'widgets.activity_metadata.numeric_summary.description',
        category: {
            key: EWidgetCategory.ActivityMetadata,
            label_key: 'widgets.categories.activity_metadata'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 },
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
const { getMetadataDefinitionStats } = useActivityMetadataDefinitionStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const definitionId = computed(
    () => props.metadataDefinitionId || props.config?.metadataDefinitionId
)
const local_stats = ref<IMetadataDefinitionSummaryDto | IMetadataDefinitionDetailDto | null>(null)
const isLoadingLocal = ref(false)

// Only show this widget for NUMBER type metadata
const SUPPORTED_TYPES: ActivityMetadataType[] = ['NUMBER']

const isTypeCompatible = computed(() => {
    if (!local_stats.value) return true // Don't show incompatible msg while loading
    return isMetadataTypeSupported(local_stats.value.metadata_type, SUPPORTED_TYPES)
})

const translatedSupportedTypes = computed(() => {
    return getTranslatedMetadataTypes(SUPPORTED_TYPES, t)
})

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId || !activityId.value) return

    isLoadingLocal.value = true
    try {
        const res = await getMetadataDefinitionStats(
            serverId,
            activityId.value,
            definitionId.value,
            {
                page: 1,
                limit: 1
            }
        )
        if (res.data?.data && res.data.data.length > 0) {
            local_stats.value = res.data.data[0]
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchStats()
})

watch(
    () => [server_store.getPublicId, definitionId.value, activityId.value],
    () => {
        void fetchStats()
    }
)

const numericSummary = computed((): INumericSummary | undefined => {
    if (!local_stats.value) return undefined

    // Check if it's SummaryDto
    if ('numeric_summary' in local_stats.value && local_stats.value.numeric_summary) {
        return local_stats.value.numeric_summary
    }

    // Check if it's DetailDto with direct fields
    // We assume DetailDto fields are populated if used as summary
    const detail = local_stats.value as IMetadataDefinitionDetailDto
    if (
        detail.sum !== undefined &&
        detail.avg !== undefined &&
        detail.min !== undefined &&
        detail.max !== undefined
    ) {
        return {
            sum: detail.sum,
            avg: detail.avg,
            min: detail.min,
            max: detail.max
        }
    }

    return undefined
})

function formatNumber(val: number | undefined): string {
    if (val === undefined || val === null) return '-'
    return Number.isInteger(val) ? String(val) : val.toFixed(2)
}

const stats = computed(() => [
    {
        label: t('widgets.activity_metadata.numeric_summary.sum'),
        value: formatNumber(numericSummary.value?.sum),
        icon: 'pi pi-plus',
        color: 'text-blue-600',
        bg: 'bg-blue-100'
    },
    {
        label: t('widgets.activity_metadata.numeric_summary.avg'),
        value: formatNumber(numericSummary.value?.avg),
        icon: 'pi pi-chart-line',
        color: 'text-green-600',
        bg: 'bg-green-100'
    },
    {
        label: t('widgets.activity_metadata.numeric_summary.min'),
        value: formatNumber(numericSummary.value?.min),
        icon: 'pi pi-arrow-down',
        color: 'text-cyan-600',
        bg: 'bg-cyan-100'
    },
    {
        label: t('widgets.activity_metadata.numeric_summary.max'),
        value: formatNumber(numericSummary.value?.max),
        icon: 'pi pi-arrow-up',
        color: 'text-orange-600',
        bg: 'bg-orange-100'
    }
])
</script>

<template>
    <div class="relative bg-surface-0 rounded-2xl p-5 shadow-sm ring-1 ring-surface-200/60 h-full">
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
                <i class="pi pi-calculator text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('widgets.activity_metadata.numeric_summary.title') }}
                </h3>
                <p class="text-xs text-surface-500">
                    {{ t('widgets.activity_metadata.numeric_summary.description') }}
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingLocal" class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-surface-100 animate-pulse"></div>
        </div>

        <!-- Incompatible Type Warning -->
        <div
            v-else-if="!isTypeCompatible"
            class="flex flex-col items-center justify-center h-32 text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200"
        >
            <i class="pi pi-exclamation-triangle text-amber-500 text-2xl mb-2"></i>
            <p class="text-sm text-center">
                {{ t('widgets.activity_metadata.incompatible_type') }}
            </p>
            <p class="text-xs text-surface-400 mt-1">
                {{
                    t('widgets.activity_metadata.supported_types', {
                        types: translatedSupportedTypes
                    })
                }}
            </p>
        </div>

        <!-- Stats Grid -->
        <div v-else-if="numericSummary" class="grid grid-cols-2 gap-3">
            <div
                v-for="stat in stats"
                :key="stat.label"
                class="p-3 rounded-xl bg-surface-50/80 border border-surface-100"
            >
                <div class="flex items-center gap-2 mb-1">
                    <div :class="[stat.bg, stat.color, 'p-1.5 rounded-lg']">
                        <i :class="[stat.icon, 'text-xs']"></i>
                    </div>
                    <span class="text-xs text-surface-500 font-medium">{{ stat.label }}</span>
                </div>
                <p class="text-lg font-bold text-surface-900 truncate">{{ stat.value }}</p>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center h-32 text-surface-400">
            <i class="pi pi-calculator text-2xl mb-2"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>
    </div>
</template>
