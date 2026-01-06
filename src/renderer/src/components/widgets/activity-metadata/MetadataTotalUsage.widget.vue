<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityMetadataDefinitionStatsCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityMetadataIdentityCorner from '@/components/activities/profile/ActivityMetadataIdentityCorner.vue'
import type {
    IWidgetMetadata,
    IActivityMetadataWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMetadataDefinitionSummaryDto } from '@shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-metadata-total-usage',
        title_key: 'widgets.activity_metadata.total_usage.title',
        icon: 'pi pi-check-square',
        description_key: 'widgets.activity_metadata.total_usage.description',
        category: {
            key: EWidgetCategory.ActivityMetadata,
            label_key: 'widgets.categories.activity_metadata'
        },
        defaultSize: { w: 1, h: 2, minW: 1, minH: 2 },
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
const { getAllMetadataDefinitionsStats } = useActivityMetadataDefinitionStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const definitionId = computed(
    () => props.metadataDefinitionId || props.config?.metadataDefinitionId
)
const local_stats = ref<IMetadataDefinitionSummaryDto | null>(null)
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!definitionId.value || !serverId || !activityId.value) return

    isLoadingLocal.value = true
    try {
        const res = await getAllMetadataDefinitionsStats(serverId, activityId.value, {
            page: 1,
            limit: 100
        })
        if (res.data?.data) {
            const found = res.data.data.find(
                (d) => d.metadata_definition_id === definitionId.value
            )
            if (found) {
                local_stats.value = found
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

const value = computed(() => local_stats.value?.total_usage || 0)
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('widgets.activity_metadata.total_usage.title')"
        :value="value"
        icon="pi pi-check-square"
        color="text-blue-600"
        bg="bg-blue-100"
        :loading="isLoadingLocal"
    >
        <template #corner>
            <ActivityMetadataIdentityCorner
                :show="props.showIdentity"
                :activity-id="activityId"
                :metadata-definition-id="definitionId"
            />
        </template>
    </BaseOverviewStatWidget>
</template>
