<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import ActivityDetailHeader from '@/components/activities/profile/ActivityDetailHeader.vue'
import ActivityDurationWidget from '@/components/widgets/activity/ActivityDuration.widget.vue'
import ActivityPopularityWidget from '@/components/widgets/activity/ActivityPopularity.widget.vue'
import ActivityLikesWidget from '@/components/widgets/activity/ActivityLikes.widget.vue'
import ActivityTopContributorsWidget from '@/components/widgets/activity/ActivityTopContributors.widget.vue'
import ActivityGrowthComparisonWidget from '@/components/widgets/activity/ActivityGrowthComparison.widget.vue'
import ActivitySessionsTableWidget from '@/components/widgets/activity/ActivitySessionsTable.widget.vue'
import ActivitySkillDistribution from '@/components/activities/profile/ActivitySkillDistribution.vue'
import ActivityMetadataList from '@/components/activities/profile/ActivityMetadataList.vue'
import ActivitySessionsHeatmapWidget from '@/components/widgets/activity/ActivitySessionsHeatmap.widget.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import SessionCreateDialog from '@/components/sessions/create/SessionCreateDialog.vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useActivitySkillLevelCRUD } from '@/composables/activities/skillLevels/useActivitySkillLevelCRUD'
import { useActivityMetadataDefinitionCRUD } from '@/composables/activities/metadata/useActivityMetadataDefinitionCRUD'
import { useActivityStatsCRUD } from '@/composables/activities/useActivityStatsCRUD'
import { useServerStore } from '@/stores/server'
import type {
    IActivity
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/entities/activity-skill-level.interfaces'
import type { IActivityMetadataDefinition } from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import type { IActivityStatsDetails } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ActivityEditDialog from '@/components/activities/create-edit/ActivityEditDialog.vue'
import ActivityTimelineChartWidget from '@/components/widgets/activity/ActivityTimelineChart.widget.vue'
import ActivityRankingWidget from '@/components/widgets/activity/ActivityRanking.widget.vue'
import ActivityParticipantsWidget from '@/components/widgets/activity/ActivityParticipants.widget.vue'
import ActivityPatternsSummaryWidget from '@/components/widgets/activity/ActivityPatternsSummary.widget.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const router = useRouter()
const activityId = computed(() => route.params.activityId as string)

const { getActivityById, deleteActivity } = useActivityCRUD()
const { getActivityStatsDetails } = useActivityStatsCRUD()
const { listSkillLevels } = useActivitySkillLevelCRUD()
const { listMetadataDefinitions } = useActivityMetadataDefinitionCRUD()
const server_store = useServerStore()

const activity = ref<IActivity | null>(null)
const activityDetails = ref<IActivityStatsDetails | null>(null)
const skillLevels = ref<IActivitySkillLevel[]>([])
const metadataDefinitions = ref<IActivityMetadataDefinition[]>([])
const show_delete_confirm = ref(false)
const show_create_session_dialog = ref(false)
const show_edit_dialog = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'stats' | 'details'>('stats')

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

        if (activityRes.error || !activityRes.data) {
            error.value = activityRes.error ?? t('messages.error.fetch')
            return
        }
        if (detailsRes.error || !detailsRes.data) {
            error.value = detailsRes.error ?? t('messages.error.fetch')
            return
        }

        activity.value = activityRes.data
        activityDetails.value = detailsRes.data ?? null
        skillLevels.value = skillRes.data ?? []
        metadataDefinitions.value = metadataRes.data ?? []
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
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
    // Reload stats as they might have changed
    if (server_store.getPublicId && activityId.value) {
        const res = await getActivityStatsDetails(server_store.getPublicId, activityId.value)
        if (res.data) {
            activityDetails.value = res.data
        }
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
            :stats="activityDetails"
            @create-session="show_create_session_dialog = true"
            @edit="handleEdit"
            @delete="handleDelete"
        />

        <Tabs v-model:value="activeTab" class="mt-4">
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

            <TabPanels class="bg-transparent! overflow-hidden">
                <TabPanel value="stats" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'stats'" key="stats-content">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <ActivityDurationWidget :show-identity="false" />
                                <ActivityPopularityWidget :show-identity="false" />
                                <ActivityLikesWidget :show-identity="false" />
                            </div>

                            <ActivityTimelineChartWidget :show-identity="false" class="mb-6" />

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                                <div class="space-y-5 min-w-0">
                                    <ActivityRankingWidget :show-identity="false" />
                                    <ActivityGrowthComparisonWidget :show-identity="false" />
                                    <ActivityTopContributorsWidget :show-identity="false" />
                                </div>
                                <div class="space-y-5 min-w-0">
                                    <ActivityParticipantsWidget :show-identity="false" />
                                    <ActivityPatternsSummaryWidget :show-identity="false" />
                                </div>
                            </div>

                            <!-- Heatmap in its own full-width card -->
                            <ActivitySessionsHeatmapWidget :show-identity="false" class="mb-6 w-full" />

                            <!-- Recent sessions widget -->
                            <ActivitySessionsTableWidget :show-identity="false" class="mb-6" />
                        </div>
                    </TransitionWrapper>
                </TabPanel>
                <TabPanel value="details" class="p-0!">
                    <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
                        <div v-if="activeTab === 'details'" key="details-content">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                                <div class="space-y-5 min-w-0">
                                    <ActivityMetadataList :metadata-definitions="metadataDefinitions" />
                                </div>
                                <div class="space-y-5 min-w-0">
                                    <ActivitySkillDistribution :skill-levels="skillLevels" />
                                </div>
                            </div>
                        </div>
                    </TransitionWrapper>
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
