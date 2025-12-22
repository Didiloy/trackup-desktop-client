<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import ActivityDetailHeader from '@/components/activities/profile/ActivityDetailHeader.vue'
import ActivityDurationWidget from '@/components/widgets/activity/ActivityDurationWidget.vue'
import ActivityPopularityWidget from '@/components/widgets/activity/ActivityPopularityWidget.vue'
import ActivityLikesWidget from '@/components/widgets/activity/ActivityLikesWidget.vue'
import ActivityTopContributors from '@/components/widgets/activity/ActivityTopContributors.vue'
import ActivitySessionsTable from '@/components/activities/profile/ActivitySessionsTable.vue'
import ActivityGrowthComparison from '@/components/widgets/activity/ActivityGrowthComparison.vue'
import ActivitySkillDistribution from '@/components/activities/profile/ActivitySkillDistribution.vue'
import ActivityMetadataList from '@/components/activities/profile/ActivityMetadataList.vue'
import ActivitySessionsHeatmap from '@/components/widgets/activity/ActivitySessionsHeatmap.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import SessionCreateDialog from '@/components/sessions/create/SessionCreateDialog.vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import { useActivityStatsStore } from '@/stores/activity-stats'
import type {
    IActivity,
    IActivitySessionListItem
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ActivityEditDialog from '@/components/activities/create-edit/ActivityEditDialog.vue'
import ActivityTimelineChart from '@/components/widgets/activity/ActivityTimelineChart.vue'
import ActivityRankingWidget from '@/components/widgets/activity/ActivityRankingWidget.vue'
import ActivityParticipantsWidget from '@/components/widgets/activity/ActivityParticipantsWidget.vue'
import ActivityPatternsSummary from '@/components/widgets/activity/ActivityPatternsSummary.vue'
import ActivitySparkline from '@/components/widgets/activity/ActivitySparkline.vue'

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const router = useRouter()
const activityId = computed(() => route.params.activityId as string)

const { getActivityById, listActivitySessions, deleteActivity } = useActivityCRUD()
const activity_stats_store = useActivityStatsStore()
const { listSkillLevels } = useActivitySkillLevelCRUD()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()

const activity = ref<IActivity | null>(null)
const skillLevels = ref<IActivitySkillLevel[]>([])
const metadataDefinitions = ref<IActivityMetadataDefinition[]>([])
const sessions = ref<IActivitySessionListItem[]>([])
const sessions_total = ref(0)
const sessions_page = ref(1)
const sessions_rows = ref(10)
const show_delete_confirm = ref(false)
const show_create_session_dialog = ref(false)
const show_edit_dialog = ref(false)
const loading = ref(true)
const sessions_loading = ref(false)
const error = ref<string | null>(null)

async function loadActivity(): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    loading.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        const [activityRes, detailsRes, skillRes, metadataRes] = await Promise.all([
            getActivityById(serverId, activityId.value),
            activity_stats_store.fetchDetails(serverId, activityId.value),
            listSkillLevels(serverId, activityId.value),
            listMetadataDefinitions(serverId, activityId.value)
        ])

        if (activityRes.error || !activityRes.data) {
            error.value = activityRes.error ?? t('messages.error.fetch')
            return
        }
        if (detailsRes.error || !detailsRes.data) {
            error.value = detailsRes.error ?? t('messages.error.fetch')
            return
        }

        activity.value = activityRes.data
        skillLevels.value = skillRes.data ?? []
        metadataDefinitions.value = metadataRes.data ?? []
        await loadSessions()
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
}

async function loadSessions(page = sessions_page.value, rows = sessions_rows.value): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    sessions_loading.value = true
    try {
        const res = await listActivitySessions(server_store.getPublicId, activityId.value, {
            page,
            limit: rows
        })
        if (res.error || !res.data) {
            error.value = res.error ?? t('messages.error.fetch')
            return
        }
        sessions.value = res.data.data as unknown as IActivitySessionListItem[]
        sessions_total.value = res.data.total
        sessions_page.value = res.data.page
        sessions_rows.value = res.data.limit
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        sessions_loading.value = false
    }
}

function handleSessionPage(event: { page: number; rows: number }): void {
    void loadSessions(event.page, event.rows)
}

function handleEdit(): void {
    show_edit_dialog.value = true
}

async function handleDelete(): Promise<void> {
    show_delete_confirm.value = true
}

async function confirmDelete(): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    try {
        const res = await deleteActivity(server_store.getPublicId, activityId.value)
        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.delete'),
                detail: res.error,
                life: 2500
            })
            return
        }
        toast.add({ severity: 'success', summary: t('messages.success.delete'), life: 2000 })
        await router.push({ name: 'ServerActivities', params: { id: server_store.getPublicId } })
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.delete'),
            detail: e instanceof Error ? e.message : String(e),
            life: 2500
        })
    }
}

async function handleSessionCreated(): Promise<void> {
    await loadSessions()
    // Also reload stats as they might have changed
    if (server_store.getPublicId && activityId.value) {
        await activity_stats_store.fetchDetails(server_store.getPublicId, activityId.value)
    }
}

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        if (server_store.getPublicId && activityId.value) {
            void loadActivity()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && activityId.value) {
        await loadActivity()
    }
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <ActivityDetailHeader
            :activity="activity"
            @create-session="show_create_session_dialog = true"
            @edit="handleEdit"
            @delete="handleDelete"
        />

        <Tabs value="stats" class="mt-4">
            <TabList class="mb-4 flex items-center justify-between w-full pr-4">
                <div class="flex items-center">
                    <Tab value="stats">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-chart-bar"></i>
                            <span>{{ t('views.activity.tabs.stats') }}</span>
                        </div>
                    </Tab>
                    <Tab value="details">
                        <div class="flex items-center gap-2 px-2">
                            <i class="pi pi-info-circle"></i>
                            <span>{{ t('views.activity.tabs.details') }}</span>
                        </div>
                    </Tab>
                </div>
            </TabList>

            <TabPanels class="bg-transparent! p-0!">
                <TabPanel value="stats">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <ActivityDurationWidget />
                        <ActivityPopularityWidget />
                        <ActivityLikesWidget />
                    </div>

                    <ActivityTimelineChart class="mb-6" />

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                        <div class="space-y-5 min-w-0">
                            <ActivityRankingWidget />
                            <ActivityGrowthComparison />
                            <ActivityTopContributors />
                        </div>
                        <div class="space-y-5 min-w-0">
                            <ActivityParticipantsWidget />
                            <ActivityPatternsSummary />
                        </div>
                    </div>

                    <!-- Heatmap in its own full-width card -->
                    <ActivitySessionsHeatmap class="mb-6 w-full" />

                    <ActivitySparkline class="mb-6 w-full" />

                    <!-- Recent sessions table in a separate card -->
                    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <p class="text-sm font-semibold text-surface-600">
                                {{ t('views.activity.recent_sessions') }}
                            </p>
                        </div>
                        <ActivitySessionsTable
                            :sessions="sessions"
                            :loading="sessions_loading"
                            :total="sessions_total"
                            :page="sessions_page"
                            :rows="sessions_rows"
                            @page="handleSessionPage"
                        />
                    </div>
                </TabPanel>

                <TabPanel value="details">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                        <div class="space-y-5 min-w-0">
                            <ActivityMetadataList :metadata-definitions="metadataDefinitions" />
                        </div>
                        <div class="space-y-5 min-w-0">
                            <ActivitySkillDistribution :skill-levels="skillLevels" />
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <ConfirmationDialog
            :model-value="show_delete_confirm"
            :title="t('common.actions.delete')"
            :message="t('messages.warning.delete')"
            :confirmation-name="activity?.name ?? ''"
            @update:model-value="show_delete_confirm = $event"
            @confirm="confirmDelete"
        />

        <SessionCreateDialog
            v-model="show_create_session_dialog"
            :pre-selected-activity-id="activityId"
            @created="handleSessionCreated"
        />

        <ActivityEditDialog
            v-if="activity"
            v-model="show_edit_dialog"
            :activity="activity"
            @updated="loadActivity"
        />
    </div>
</template>
