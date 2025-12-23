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
        id: 'activity-popularity',
        title: 'Popularité',
        icon: 'pi pi-bolt',
        description: "Affiche le score de popularité de l'activité",
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
