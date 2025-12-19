<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import ActivityDetailHeader from '@/components/activities/profile/ActivityDetailHeader.vue'
import ActivityStatsOverview from '@/components/activities/profile/ActivityStatsOverview.vue'
import ActivityPerformanceSection from '@/components/widgets/activity/ActivityPerformanceSection.vue'
import ActivityTopContributors from '@/components/widgets/activity/ActivityTopContributors.vue'
import ActivitySessionsTable from '@/components/widgets/activity/ActivitySessionsTable.vue'
import ActivityGrowthComparison from '@/components/widgets/activity/ActivityGrowthComparison.vue'
import ActivitySkillDistribution from '@/components/widgets/activity/ActivitySkillDistribution.vue'
import ActivityMetadataList from '@/components/activities/profile/ActivityMetadataList.vue'
import ActivitySessionsHeatmap from '@/components/widgets/activity/ActivitySessionsHeatmap.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import SessionCreateDialog from '@/components/sessions/create/SessionCreateDialog.vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity,
    IActivitySessionListItem
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ActivityEditDialog from '@/components/activities/create-edit/ActivityEditDialog.vue'

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const router = useRouter()
const activityId = computed(() => route.params.activityId as string)

const { getActivityById, listActivitySessions, deleteActivity } = useActivityCRUD()
const { getActivityStatsDetails } = useActivityStatsCRUD()
const { listSkillLevels } = useActivitySkillLevelCRUD()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()

const activity = ref<IActivity | null>(null)
const details = ref<IActivityStatsDetails | null>(null)
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
const last_year_sessions = ref<IActivitySessionListItem[]>([])

async function loadActivity(): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    loading.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        const [activityRes, detailsRes, skillRes, metadataRes] = await Promise.all([
            getActivityById(serverId, activityId.value),
            getActivityStatsDetails(serverId, activityId.value),
            listSkillLevels(serverId, activityId.value),
            listMetadataDefinitions(serverId, activityId.value)
        ])

        if (activityRes.error || !activityRes.data) throw new Error(activityRes.error)
        if (detailsRes.error || !detailsRes.data) throw new Error(detailsRes.error)

        activity.value = activityRes.data
        details.value = detailsRes.data
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
        if (res.error || !res.data) throw new Error(res.error)
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

async function loadLastYearSessions(): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    const res = await listActivitySessions(server_store.getPublicId, activityId.value, {
        limit: 100
    })
    if (res.error || !res.data) throw new Error(res.error)
    last_year_sessions.value = res.data.data as unknown as IActivitySessionListItem[]
    //TODO: implement a real load last year because now it's just a dummy data
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
        if (res.error) throw new Error(res.error)
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
        const detailsRes = await getActivityStatsDetails(server_store.getPublicId, activityId.value)
        if (!detailsRes.error && detailsRes.data) {
            details.value = detailsRes.data
        }
    }
}

watch(
    () => [server_store.getPublicId, activityId.value],
    () => {
        if (server_store.getPublicId && activityId.value) {
            void loadActivity()
            void loadLastYearSessions()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && activityId.value) {
        await loadActivity()
        await loadLastYearSessions()
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
            :stats="details"
            @create-session="show_create_session_dialog = true"
            @edit="handleEdit"
            @delete="handleDelete"
        />

        <ActivityStatsOverview v-if="details" :stats="details" class="mb-6" />

        <ActivityPerformanceSection
            class="mb-6"
            :timeline="details?.timeline"
            :growth="details?.growth_trend"
            :patterns="details?.time_patterns"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <ActivityTopContributors :contributors="details?.top_contributors" />
            <ActivityMetadataList :metadata-definitions="metadataDefinitions" />
            <ActivitySkillDistribution :skill-levels="skillLevels" />
            <ActivityGrowthComparison :growth="details?.growth_trend" />
        </div>

        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-semibold text-surface-600">
                    {{ t('views.activity.recent_sessions') }}
                </p>
            </div>
            <ActivitySessionsHeatmap :sessions="last_year_sessions" class="mb-6" />
            <ActivitySessionsTable
                :sessions="sessions"
                :loading="sessions_loading"
                :total="sessions_total"
                :page="sessions_page"
                :rows="sessions_rows"
                @page="handleSessionPage"
            />
        </div>

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
