<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberActivityStatsCRUD } from '@/composables/members/useMemberActivityStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberActivityStats } from '@shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { translateSkillLevel } from '@/utils/skill-level.utils'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import { formatDate } from '@/utils'

defineOptions({
    widgetMetadata: {
        id: 'member-activities-table',
        title_key: 'widgets.member.activities_table.title',
        icon: 'pi pi-th-large',
        description_key: 'widgets.member.activities_table.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 6, h: 8, minW: 4, minH: 6 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberWidgetConfig
    }>(),
    {
        showIdentity: true
    }
)

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const server_store = useServerStore()
const { getAllMemberActivitiesStats } = useMemberActivityStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const activities = ref<IMemberActivityStats[]>([])
const total = ref(0)
const first = ref(0)
const pageSize = 10
const isLoading = ref(false)

async function loadActivities(page = 0): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getAllMemberActivitiesStats(serverId, memberId.value, {
            page: page + 1,
            limit: pageSize
        })

        if (res.data) {
            activities.value = res.data.data
            total.value = res.data.total
        }
    } finally {
        isLoading.value = false
    }
}

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        first.value = 0
        void loadActivities(0)
    },
    { immediate: true }
)

const onPageChange = (event: { first: number; page: number }): void => {
    first.value = event.first
    void loadActivities(event.page)
}

const navigateToActivity = async (activityId: string): Promise<void> => {
    await router.push({
        name: 'ServerActivityProfile',
        params: {
            id: server_store.getPublicId,
            activityId
        }
    })
}

</script>

<template>
    <BaseWidgetContainer :title="t('widgets.member.activities_table.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />

        <div
            v-if="activities.length === 0 && !isLoading"
            class="flex items-center justify-center h-64"
        >
            <p class="text-surface-400">{{ t('common.fields.no_data') }}</p>
        </div>

        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <div
                v-for="activity in activities"
                :key="activity.activity_id"
                class="group relative rounded-2xl border border-surface-200 bg-white hover:bg-surface-50 hover:shadow-md hover:border-primary-200 transition-all duration-300 overflow-hidden cursor-pointer p-4"
                @click="navigateToActivity(activity.activity_id)"
            >
                <!-- Activity Name & Skill Level -->
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-lg text-surface-900 truncate mb-1">
                            {{ activity.activity_name }}
                        </h3>
                        <div
                            v-if="activity.skill_level"
                            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium"
                        >
                            <i class="pi pi-graduation-cap"></i>
                            <span>{{ translateSkillLevel(activity.skill_level, t) }}</span>
                        </div>
                    </div>
                    <div v-if="activity.proficiency_score" class="text-center ml-3 shrink-0">
                        <div class="text-xs text-surface-600 mb-0.5">
                            {{ t('widgets.member_activity.overview.proficiency') }}
                        </div>
                        <div class="text-xl font-bold text-blue-600">
                            {{ activity.proficiency_score.toFixed(1) }}
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3 mb-3">
                    <div class="p-2 rounded-xl bg-surface-50">
                        <div class="text-xs text-surface-600 mb-0.5">
                            {{ t('views.server_members.activities.sessions') }}
                        </div>
                        <div class="font-bold text-surface-900">{{ activity.total_sessions }}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-surface-50">
                        <div class="text-xs text-surface-600 mb-0.5">
                            {{ t('widgets.member_activity.overview.total_duration') }}
                        </div>
                        <div class="font-bold text-primary-600">
                            {{ formatMinutesToLabel(activity.total_duration) }}
                        </div>
                    </div>
                    <div class="p-2 rounded-xl bg-surface-50">
                        <div class="text-xs text-surface-600 mb-0.5">
                            {{ t('widgets.member_activity.overview.avg_duration') }}
                        </div>
                        <div class="font-bold text-surface-900">
                            {{ formatMinutesToLabel(activity.avg_session_duration) }}
                        </div>
                    </div>
                </div>

                <!-- Additional Info -->
                <div class="flex items-center justify-between text-xs text-surface-500">
                    <div v-if="activity.last_session_date" class="flex items-center gap-1">
                        <i class="pi pi-calendar"></i>
                        <span
                            >{{ t('widgets.member_activity.overview.last_session') }}:
                            {{ formatDate(activity.last_session_date) }}</span
                        >
                    </div>
                    <i
                        class="pi pi-arrow-right text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    ></i>
                </div>
            </div>
        </div>

        <Paginator
            v-if="total > pageSize"
            :first="first"
            :rows="pageSize"
            :total-records="total"
            class="mt-4"
            @page="onPageChange"
        />
    </BaseWidgetContainer>
</template>
