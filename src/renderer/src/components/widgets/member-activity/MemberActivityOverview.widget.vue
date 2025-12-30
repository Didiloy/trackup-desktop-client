<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberActivityStatsCRUD } from '@/composables/members/useMemberActivityStatsCRUD'
import { formatMinutesToLabel } from '@/utils/time.utils'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import {
    type IWidgetMetadata,
    type IMemberActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberActivityDetails } from '@shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'member-activity-overview',
        title_key: 'widgets.member_activity.overview.title',
        icon: 'pi pi-chart-line',
        description_key: 'widgets.member_activity.overview.description',
        category: {
            key: EWidgetCategory.MemberActivities,
            label_key: 'widgets.categories.member_activity'
        },
        defaultSize: { w: 4, h: 5, minW: 3, minH: 4 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

import { translateSkillLevel } from '@/utils/skill-level.utils'

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberActivityWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberActivityStats } = useMemberActivityStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const activityId = computed(() => (route.params.activityId as string) || props.config?.activityId)
const stats = ref<IMemberActivityDetails | null>(null)
const isLoading = ref(false)

async function fetchStats(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !activityId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberActivityStats(serverId, memberId.value, activityId.value)
        if (res.data) {
            stats.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchStats()
})

watch(
    () => [server_store.getPublicId, memberId.value, activityId.value],
    () => {
        void fetchStats()
    }
)

const avgDurationLabel = computed(() =>
    stats.value ? formatMinutesToLabel(stats.value.avg_session_duration) : '0m'
)
const totalDurationLabel = computed(() =>
    stats.value ? formatMinutesToLabel(stats.value.total_duration) : '0m'
)

const skillLevelLabel = computed(() => translateSkillLevel(stats.value?.skill_level, t))
</script>

<template>
    <BaseWidgetContainer :title="t('widgets.member_activity.overview.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <ActivityIdentityCorner
            :show="props.showIdentity"
            :activity-id="activityId"
            class="top-4 right-[130px]"
        />

        <div v-if="stats" class="space-y-4">
            <!-- Activity Name -->
            <div class="text-center pb-3 border-b border-surface-200">
                <h3 class="text-lg font-bold text-surface-900">
                    {{ stats.activity_name }}
                </h3>
            </div>

            <!-- Skill & Proficiency -->
            <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-primary-50 text-center">
                    <div class="text-xs text-surface-600 mb-1">
                        {{ t('widgets.member_activity.overview.skill_level') }}
                    </div>
                    <div class="text-lg font-bold text-primary-600">
                        {{ skillLevelLabel }}
                    </div>
                </div>
                <div class="p-3 rounded-xl bg-blue-50 text-center">
                    <div class="text-xs text-surface-600 mb-1">
                        {{ t('widgets.member_activity.overview.proficiency') }}
                    </div>
                    <div class="text-lg font-bold text-blue-600">
                        {{ stats.proficiency_score?.toFixed(1) || '0' }}
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="space-y-2">
                <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50">
                    <span class="text-sm text-surface-700">
                        {{ t('widgets.member_activity.overview.total_sessions') }}
                    </span>
                    <span class="font-bold text-surface-900">{{ stats.total_sessions }}</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50">
                    <span class="text-sm text-surface-700">
                        {{ t('widgets.member_activity.overview.total_duration') }}
                    </span>
                    <span class="font-bold text-surface-900">{{ totalDurationLabel }}</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50">
                    <span class="text-sm text-surface-700">
                        {{ t('widgets.member_activity.overview.avg_duration') }}
                    </span>
                    <span class="font-bold text-surface-900">{{ avgDurationLabel }}</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50">
                    <span class="text-sm text-surface-700">
                        {{ t('widgets.member_activity.overview.sessions_created') }}
                    </span>
                    <span class="font-bold text-surface-900">{{ stats.sessions_created }}</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-surface-50">
                    <span class="text-sm text-surface-700">
                        {{ t('widgets.member_activity.overview.total_likes') }}
                    </span>
                    <span class="font-bold text-surface-900">{{ stats.total_likes }}</span>
                </div>
            </div>

            <!-- Last Session -->
            <div v-if="stats.last_session_date" class="text-center text-xs text-surface-500 pt-2">
                {{ t('widgets.member_activity.overview.last_session') }}:
                {{ new Date(stats.last_session_date).toLocaleDateString() }}
            </div>
        </div>

        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.fields.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
