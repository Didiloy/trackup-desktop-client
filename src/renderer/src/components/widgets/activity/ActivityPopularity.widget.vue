<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type {
    IActivityStats,
    IActivityStatsDetails
} from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-popularity',
        title_key: 'widgets.activity.popularity.title',
        icon: 'pi pi-bolt',
        description_key: 'widgets.activity.popularity.description',
        category: {
            key: EWidgetCategory.Activity,
            label_key: 'widgets.categories.activity'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IActivityWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)
const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getActivityStats } = useActivityStatsCRUD()

const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const local_stats = ref<IActivityStats | null>(null)
const isLoadingLocal = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!activityId.value || !serverId) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStats(serverId, activityId.value)
        if (res.data) {
            local_stats.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    void fetchStats()
})

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        void fetchStats()
    }
)

const statsData = computed(() => local_stats.value)
const loading = computed(() => isLoadingLocal.value)

const value = computed(() => (statsData.value?.popularity_score ?? 0).toFixed(0))
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.popularity')"
        :value="value"
        icon="pi pi-bolt"
        color="text-amber-500"
        bg="bg-amber-50"
        :show-identity="props.showIdentity"
        :loading="loading"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />
        </template>
    </BaseOverviewStatWidget>
</template>
