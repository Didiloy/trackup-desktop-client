<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ActivityCreateDialog from '@/components/activities/create-edit/ActivityCreateDialog.vue'
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue'
import ActivityCardGrid from '@/components/activities/ActivityCardGrid.vue'
import { onMounted, ref } from 'vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'
import { asyncPool } from '@/utils'
import { usePaginatedFetcher } from '@/composables/usePaginatedFetcher'
import { IActivityStats } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { useActivityNavigation } from '@/composables/activities/useActivityNavigation'
import { ESearchMode } from '@shared/contracts/enums/search-mode.enum'

const { t } = useI18n()
const { navigateToActivityProfile } = useActivityNavigation()
const { listActivities } = useActivityCRUD()
const { getActivityStats } = useActivityStatsCRUD()
const server_store = useServerStore()

const show_add_activity_dialog = ref(false)
const card_metrics = ref<Record<string, ActivityCardMetrics>>({})

const filter_query = ref('')
const filter_SearchMode = ref<ESearchMode>(ESearchMode.CONTAINS)

/**
 * Fonction pour transformer les stats en metrics
 */
function mapDetailsToMetrics(details: IActivityStats): ActivityCardMetrics {
    return {
        totalSessions: details.total_sessions,
        totalDuration: details.total_duration,
        avgSessionDuration: details.avg_duration,
        totalLikes: details.total_likes,
        avgLikesPerSession: details.avg_likes_per_session,
        uniqueParticipants: details.unique_participants
    }
}

/**
 * Fonction pour charger les stats uniquement pour les nouvelles activités
 */
async function loadActivityInsights(newActivities: IActivity[]): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !newActivities.length) return

    const results = await asyncPool(8, newActivities, async (activity: IActivity) => {
        const res = await getActivityStats(serverId, activity.public_id)
        if (res.error || !res.data) throw new Error(t('messages.error.fetch'))
        return [activity.public_id, mapDetailsToMetrics(res.data)] as const
    })

    for (const result of results) {
        if (result.status === 'fulfilled') {
            const [id, metrics] = result.value
            card_metrics.value[id] = metrics
        }
    }
}

/**
 * Composable générique pour fetch + pagination
 */
const {
    items: activities,
    loading,
    error,
    hasMore,
    load,
    loadMore
} = usePaginatedFetcher<IActivity>({
    fetcher: async ({ page, limit }) => {
        if (!server_store.getPublicId) {
            return { data: [], total: 0, error: t('messages.error.noServerSelected') }
        }

        const res = await listActivities(server_store.getPublicId, {
            page,
            limit,
            search: filter_query.value || undefined,
            searchMode: filter_SearchMode.value
        })

        if (res.error) {
            return { data: [], total: 0, error: res.error }
        }

        return {
            data: res.data?.data ?? [],
            total: res.data?.total ?? 0
        }
    },
    onItemsAdded: async (newItems) => {
        await loadActivityInsights(newItems)
        server_store.setActivities(activities.value)
    },
    limit: 20,
    filters: [filter_query, filter_SearchMode]
})

function onAddActivity(): void {
    show_add_activity_dialog.value = true
}

async function onViewActivity(activityId: string): Promise<void> {
    await navigateToActivityProfile(activityId)
}

onMounted(() => {
    load()
})
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ t('views.server_activities.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="t('views.server_activities.add_modal.title')"
                    severity="primary"
                    size="small"
                    :pt="{
                        label: { class: 'text-surface-100' },
                        icon: { class: 'text-surface-100' }
                    }"
                    @click="onAddActivity"
                />
            </div>
        </div>

        <div class="w-full px-2 pb-2">
            <ActivityFilterBar
                :query="filter_query"
                :search-mode="filter_SearchMode"
                :count="activities.length"
                @update:query="(v) => (filter_query = v)"
                @update:search-mode="(v) => (filter_SearchMode = v)"
                @clear="load"
            />
        </div>

        <div v-if="error" class="w-full px-2 pb-2">
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                {{ error }}
            </div>
        </div>

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <ActivityCardGrid
                :activities="activities"
                :metrics="card_metrics"
                :loading="loading"
                :has-more="hasMore"
                @view="onViewActivity"
                @load-more="loadMore"
            />
        </div>

        <ActivityCreateDialog v-model="show_add_activity_dialog" @created="load" />
    </div>
</template>
