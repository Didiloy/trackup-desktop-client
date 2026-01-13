<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionStatsCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityMetadataIdentityCorner from '@/components/activities/metadata/ActivityMetadataIdentityCorner.vue'
import type {
    IWidgetMetadata,
    IActivityMetadataWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type {
    IMetadataDefinitionSummaryDto,
    IMetadataDefinitionDetailDto
} from '@shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'
import type { ActivityMetadataType } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { getTranslatedMetadataTypes, isMetadataTypeSupported } from '@/utils/metadata.utils'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'activity-metadata-most-common',
        title_key: 'widgets.activity_metadata.most_common_value.title',
        icon: 'pi pi-star',
        description_key: 'widgets.activity_metadata.most_common_value.description',
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

// Only show for STRING and BOOLEAN types
const SUPPORTED_TYPES: ActivityMetadataType[] = ['STRING', 'BOOLEAN']

const isTypeCompatible = computed(() => {
    if (!local_stats.value) return true
    return isMetadataTypeSupported(local_stats.value.metadata_type, SUPPORTED_TYPES)
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

const value = computed(() => {
    let v: string | number | boolean | undefined
    if (local_stats.value) {
        if ('most_common_value' in local_stats.value) {
            v = local_stats.value.most_common_value
        } else {
            // Assume DetailDto where the item itself is the value (distribution item)
            // DetailDto has 'value' property which is string usually
            v = (local_stats.value as IMetadataDefinitionDetailDto).value
        }
    }

    if (v === undefined || v === null) return '-'
    if (typeof v === 'boolean') return v ? t('common.misc.yes') : t('common.misc.no')
    return String(v)
})
</script>

<template>
    <!-- Incompatible Type Warning -->
    <div
        v-if="!isLoadingLocal && !isTypeCompatible"
        class="relative p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm h-full"
    >
        <div class="flex items-start justify-between mb-4">
            <div class="p-3 rounded-xl bg-amber-100 text-amber-600">
                <i class="pi pi-star text-xl"></i>
            </div>
        </div>
        <p class="text-sm text-surface-500 font-medium mb-1">
            {{ t('widgets.activity_metadata.most_common_value.title') }}
        </p>
        <div class="flex flex-col items-center justify-center py-2 text-surface-400">
            <i class="pi pi-exclamation-triangle text-amber-500 text-lg mb-1"></i>
            <p class="text-xs text-center">
                {{ t('widgets.activity_metadata.incompatible_type') }}
            </p>
        </div>
    </div>

    <BaseOverviewStatWidget
        v-else
        :label="t('widgets.activity_metadata.most_common_value.title')"
        :value="value"
        icon="pi pi-star"
        color="text-amber-600"
        bg="bg-amber-100"
        :loading="isLoadingLocal"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />
            <ActivityMetadataIdentityCorner
                :show="props.showIdentity"
                :activity-id="activityId"
                :metadata-definition-id="definitionId"
                class="top-13 right-[10px]"
            />
        </template>
    </BaseOverviewStatWidget>
</template>
