<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ActivityCreateDialog from '@/components/activities/create/ActivityCreateDialog.vue'
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue'
import ActivityCardGrid from '@/components/activities/ActivityCardGrid.vue'
import { ref, watch, onMounted, computed } from 'vue'
import type {
    IActivity,
    IListActivitiesOptions
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'

const i18n = useI18n()
const { listActivities } = useActivityCRUD()
const { getActivityDetails } = useActivityStatsCRUD()
const server_store = useServerStore()

const showAddActivityDialog = ref(false)

// Data state
const activities = ref<IActivity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const totalRecords = ref(0)
const statsLoading = ref(false)
const cardMetrics = ref<Record<string, ActivityCardMetrics>>({})

// Pagination state
const lazyParams = ref({
    page: 1,
    limit: 20
})

// Filter state
const filterQuery = ref('')
const filterSearchMode = ref<'startsWith' | 'endsWith' | 'contains' | 'exact'>('contains')

// Computed filter options that conform to IListActivitiesOptions
const filterOptions = computed<IListActivitiesOptions>(() => ({
    page: lazyParams.value.page,
    limit: lazyParams.value.limit,
    search: filterQuery.value || undefined,
    searchMode: filterSearchMode.value
}))

/**
 * Load activities from the server
 */
async function fetchActivities(): Promise<void> {
    if (!server_store.getPublicId) {
        error.value = 'No server selected'
        return
    }

    loading.value = true
    error.value = null

    try {
        const result = await listActivities(server_store.getPublicId, filterOptions.value)

        if (result.error) {
            error.value = result.error
            activities.value = []
            totalRecords.value = 0
        } else if (result.data) {
            activities.value = result.data.data
            totalRecords.value = result.data.total
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load activities'
        activities.value = []
        totalRecords.value = 0
    } finally {
        loading.value = false
    }
}

async function loadActivityInsights(currentActivities: IActivity[]): Promise<void> {
    const serverId = server_store.getPublicId
    if (!serverId || !currentActivities.length) {
        cardMetrics.value = {}
        return
    }
    statsLoading.value = true
    try {
        const results = await Promise.allSettled(
            currentActivities.map(async (activity) => {
                const res = await getActivityDetails(serverId, activity.public_id)
                if (res.error || !res.data) {
                    throw new Error(res.error || 'Failed to load activity stats')
                }
                return [activity.public_id, mapDetailsToMetrics(res.data)] as const
            })
        )
        const next: Record<string, ActivityCardMetrics> = {}
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const [activityId, metrics] = result.value
                next[activityId] = metrics
            }
        }
        cardMetrics.value = next
    } catch (err) {
        console.error('Failed to load activity insights', err)
    } finally {
        statsLoading.value = false
    }
}

function mapDetailsToMetrics(details: IActivityStatsDetails): ActivityCardMetrics {
    const growthPercent = details.growth_trend?.growth_percent ?? 0
    const timelineValues =
        details.timeline?.map((entry) => entry.sessions_count) ?? []
    const sparkline = timelineValues.slice(-12)
    return {
        totalSessions: details.total_sessions,
        totalDuration: details.total_duration,
        avgSessionDuration: details.avg_duration,
        totalLikes: details.total_likes,
        avgLikesPerSession: details.avg_likes_per_session,
        uniqueParticipants: details.unique_participants,
        totalParticipants: details.total_participants,
        avgParticipantsPerSession: details.avg_participants_per_session,
        popularityScore: details.popularity_score,
        growthPercent,
        trendPositive: growthPercent >= 0,
        topContributor: details.top_contributors?.[0]?.user_email ?? null,
        sparkline
    }
}

async function loadActivities(): Promise<void> {
    await fetchActivities()
    await loadActivityInsights(activities.value)
}

/**
 * Handle filter changes
 */
async function onFiltersChange(): Promise<void> {
    // Reset to first page when filters change
    lazyParams.value.page = 1
    await loadActivities()
}

/**
 * Handle activity creation
 */
async function onActivityCreated(activity: IActivity): Promise<void> {
    console.log('onActivityCreated', activity)
    // Refresh the list
    lazyParams.value.page = 1
    await loadActivities()
}

/**
 * Handle add activity button click
 */
function onAddActivity(): void {
    showAddActivityDialog.value = true
}

/**
 * Handle view activity
 */
function onViewActivity(activityId: string): void {
    console.log('View activity:', activityId)
    // TODO: Navigate to activity detail view
}

/**
 * Handle edit activity
 */
function onEditActivity(activityId: string): void {
    console.log('Edit activity:', activityId)
    // TODO: Open edit dialog or navigate to edit view
}

function onDeleteActivity(activityId: string): void {
    console.log('Delete activity:', activityId)
}

// Watch filter changes
watch([filterQuery, filterSearchMode], () => {
    onFiltersChange()
})

// Load activities on mount
onMounted(async () => {
    await loadActivities()
})
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('userInterface.serverActivitiesView.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="i18n.t('userInterface.serverActivitiesView.addActivity')"
                    class=""
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
                :query="filterQuery"
                :search-mode="filterSearchMode"
                @update:query="(v) => (filterQuery = v)"
                @update:search-mode="(v) => (filterSearchMode = v)"
                @change="onFiltersChange"
            />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="w-full px-2 pb-2">
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                {{ error }}
            </div>
        </div>

        <!-- Data Table -->
        <div class="flex-1 w-full px-2 overflow-hidden">
            <ActivityCardGrid
                :activities="activities"
                :metrics="cardMetrics"
                :loading="loading || statsLoading"
                @view="onViewActivity"
                @edit="onEditActivity"
                @delete="onDeleteActivity"
            />
        </div>

        <ActivityCreateDialog v-model="showAddActivityDialog" @created="onActivityCreated" />
    </div>
</template>
