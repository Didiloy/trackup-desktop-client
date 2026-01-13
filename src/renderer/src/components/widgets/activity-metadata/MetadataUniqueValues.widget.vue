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
        id: 'activity-metadata-unique-values',
        title_key: 'widgets.activity_metadata.unique_values.title',
        icon: 'pi pi-list',
        description_key: 'widgets.activity_metadata.unique_values.description',
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
const local_total = ref<number>(0)
const isLoadingLocal = ref(false)

// Only show for STRING and BOOLEAN types
const SUPPORTED_TYPES: ActivityMetadataType[] = ['STRING', 'BOOLEAN']

const isTypeCompatible = computed(() => {
    if (!local_stats.value) return true
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
        if (res.data) {
            local_total.value = res.data.total
            if (res.data.data && res.data.data.length > 0) {
                local_stats.value = res.data.data[0]
            }
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
    if (local_stats.value && 'unique_values' in local_stats.value) {
        return local_stats.value.unique_values ?? 0
    }
    return local_total.value
})
</script>

<template>
    <!-- Incompatible Type Warning -->
    <div
        v-if="!isLoadingLocal && !isTypeCompatible"
        class="relative p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm h-full"
    >
        <div class="flex items-start justify-between mb-4">
            <div class="p-3 rounded-xl bg-purple-100 text-purple-600">
                <i class="pi pi-list text-xl"></i>
            </div>
        </div>
        <p class="text-sm text-surface-500 font-medium mb-1">
            {{ t('widgets.activity_metadata.unique_values.title') }}
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
        :label="t('widgets.activity_metadata.unique_values.title')"
        :value="value"
        icon="pi pi-list"
        color="text-purple-600"
        bg="bg-purple-100"
        :loading="isLoadingLocal"
    >
        <template #corner>
            <ActivityMetadataIdentityCorner
                :show="props.showIdentity"
                :activity-id="activityId"
                :metadata-definition-id="definitionId"
            />

            <ActivityIdentityCorner
                :show="props.showIdentity"
                :activity-id="activityId"
                class="top-4 right-[125px]"
            />
        </template>
    </BaseOverviewStatWidget>
</template>
