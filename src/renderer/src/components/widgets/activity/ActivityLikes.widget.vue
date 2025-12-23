<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStatsStore } from '@/stores/activity-stats'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import BaseOverviewStatWidget from '@/components/widgets/BaseOverviewStatWidget.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { type IWidgetMetadata, type IActivityWidgetConfig } from '@shared/contracts/interfaces/widget.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'activity-likes',
        title: 'Likes',
        icon: 'pi pi-heart',
        description: 'Affiche le nombre total de likes',
        category: {
            key: EWidgetCategory.Activity,
            label: 'Activity'
        },
        defaultSize: { w: 4, h: 4, minW: 2, minH: 4 },
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
const activity_stats_store = useActivityStatsStore()
const server_store = useServerStore()
const { getActivityStatsDetails } = useActivityStatsCRUD()

const localDetails = ref<IActivityStatsDetails | null>(null)
const isLoadingLocal = ref(false)

async function fetchLocalDetails(): Promise<void> {
    if (!props.config?.activityId || !server_store.getPublicId) return

    isLoadingLocal.value = true
    try {
        const res = await getActivityStatsDetails(server_store.getPublicId, props.config.activityId)
        if (res.data) {
            localDetails.value = res.data
        }
    } finally {
        isLoadingLocal.value = false
    }
}

onMounted(() => {
    if (!activity_stats_store.getDetails && props.config?.activityId) {
        void fetchLocalDetails()
    }
})

watch(
    () => props.config?.activityId,
    (newId) => {
        if (newId && !activity_stats_store.getDetails) {
            void fetchLocalDetails()
        }
    }
)

const statsData = computed(() => activity_stats_store.getDetails ?? localDetails.value)
const loading = computed(() => activity_stats_store.isLoading || isLoadingLocal.value)

const value = computed(() => statsData.value?.total_likes.toLocaleString() ?? '0')
const subValue = computed(() => {
    if (!statsData.value) return ''
    return t('views.activity.card.avg_likes', {
        value: statsData.value.avg_likes_per_session.toFixed(1)
    })
})
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.activity.card.likes')"
        :value="value"
        :sub-value="subValue"
        icon="pi pi-heart-fill"
        color="text-red-500"
        bg="bg-red-50"
        :show-identity="props.showIdentity"
        :loading="loading"
    >
        <template #corner>
            <ActivityIdentityCorner :show="props.showIdentity" :activity-id="activityId" />
        </template>
    </BaseOverviewStatWidget>
</template>
