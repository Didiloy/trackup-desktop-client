<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import ActivityDetailHeader from '@/components/activities/detail/ActivityDetailHeader.vue'
import ActivityStatsOverview from '@/components/activities/detail/ActivityStatsOverview.vue'
import ActivityPerformanceSection from '@/components/activities/detail/ActivityPerformanceSection.vue'
import ActivityTopContributors from '@/components/activities/detail/ActivityTopContributors.vue'
import ActivitySessionsTable from '@/components/activities/detail/ActivitySessionsTable.vue'
import ActivityGrowthComparison from '@/components/activities/detail/ActivityGrowthComparison.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useActivitySkillLevelCRUD } from '@/composables/activities/useActivitySkillLevelCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity,
    IActivitySessionListItem
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const router = useRouter()
const activityId = computed(() => route.params.activityId as string)

const { getActivityById, listActivitySessions, deleteActivity } = useActivityCRUD()
const { getActivityStatsDetails } = useActivityStatsCRUD()
const { listSkillLevels } = useActivitySkillLevelCRUD()
const server_store = useServerStore()

const activity = ref<IActivity | null>(null)
const details = ref<IActivityStatsDetails | null>(null)
const skillLevels = ref<IActivitySkillLevel[]>([])
const sessions = ref<IActivitySessionListItem[]>([])
const sessionsTotal = ref(0)
const sessionsPage = ref(1)
const sessionsRows = ref(10)
const showDeleteConfirm = ref(false)

const loading = ref(true)
const sessionsLoading = ref(false)
const error = ref<string | null>(null)

async function loadActivity(): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    loading.value = true
    error.value = null
    try {
        const serverId = server_store.getPublicId
        const [activityRes, detailsRes, skillRes] = await Promise.all([
            getActivityById(serverId, activityId.value),
            getActivityStatsDetails(serverId, activityId.value),
            listSkillLevels(serverId, activityId.value)
        ])

        if (activityRes.error || !activityRes.data) throw new Error(activityRes.error)
        if (detailsRes.error || !detailsRes.data) throw new Error(detailsRes.error)

        activity.value = activityRes.data
        details.value = detailsRes.data
        skillLevels.value = skillRes.data ?? []
        await loadSessions()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load activity'
    } finally {
        loading.value = false
    }
}

async function loadSessions(page = sessionsPage.value, rows = sessionsRows.value): Promise<void> {
    if (!server_store.getPublicId || !activityId.value) return
    sessionsLoading.value = true
    try {
        const res = await listActivitySessions(server_store.getPublicId, activityId.value, {
            page,
            limit: rows
        })
        if (res.error || !res.data) throw new Error(res.error)
        sessions.value = res.data.data as unknown as IActivitySessionListItem[]
        sessionsTotal.value = res.data.total
        sessionsPage.value = res.data.page
        sessionsRows.value = res.data.limit
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load sessions'
    } finally {
        sessionsLoading.value = false
    }
}

function handleSessionPage(event: { page: number; rows: number }): void {
    void loadSessions(event.page, event.rows)
}

function handleEdit(): void {
    toast.add({
        severity: 'info',
        summary: t('actions.edit'),
        detail: 'TODO: implement edit screen',
        life: 2000
    })
}

async function handleDelete(): Promise<void> {
    showDeleteConfirm.value = true
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
    console.log('Activity mounted')
    console.log(activity.value)
    console.log(details.value)
    console.log(skillLevels.value)
    console.log(sessions.value)
    console.log(sessionsTotal.value)
    console.log(sessionsPage.value)
    console.log(sessionsRows.value)
})
</script>

<template>
    <!-- TODO voir tout les fichiers générés -->
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <ActivityDetailHeader
            :activity="activity"
            :stats="details"
            @edit="handleEdit"
            @delete="handleDelete"
        />

        <ActivityStatsOverview v-if="details" :stats="details" class="mb-6" />

        <ActivityPerformanceSection
            class="mb-6"
            :timeline="details?.timeline"
            :growth="details?.growth_trend"
            :patterns="details?.time_patterns"
            :skill-levels="skillLevels"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <ActivityTopContributors :contributors="details?.top_contributors" />
            <ActivityGrowthComparison :growth="details?.growth_trend" />
        </div>

        <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-semibold text-surface-600">Sessions récentes</p>
            </div>
            <ActivitySessionsTable
                :sessions="sessions"
                :loading="sessionsLoading"
                :total="sessionsTotal"
                :page="sessionsPage"
                :rows="sessionsRows"
                @page="handleSessionPage"
            />
        </div>

        <ConfirmationDialog
            :model-value="showDeleteConfirm"
            :title="t('actions.delete')"
            :message="t('messages.warning.delete')"
            :confirmation-name="activity?.name ?? ''"
            @update:model-value="showDeleteConfirm = $event"
            @confirm="confirmDelete"
        />
    </div>
</template>
