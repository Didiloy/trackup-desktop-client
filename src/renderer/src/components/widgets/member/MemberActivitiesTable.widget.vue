<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberActivityStatsCRUD } from '@/composables/members/useMemberActivityStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IPaginatedMemberActivityStats } from '@shared/contracts/interfaces/entities-stats/member-activity-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { formatMinutesToLabel } from '@/utils/time.utils'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-activities-table',
        title_key: 'common.widgets.member.activities_table.title',
        icon: 'pi pi-th-large',
        description_key: 'common.widgets.member.activities_table.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'common.widgets.categories.member'
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
        showIdentity: true,
        config: undefined
    }
)
const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getAllMemberActivitiesStats } = useMemberActivityStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const activities = ref<IPaginatedMemberActivityStats | null>(null)
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const first = computed(() => (currentPage.value - 1) * pageSize.value)

async function fetchActivities(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getAllMemberActivitiesStats(serverId, memberId.value, {
            page: currentPage.value,
            limit: pageSize.value
        })
        if (res.data) {
            activities.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchActivities()
})

watch(
    () => [server_store.getPublicId, memberId.value, currentPage.value],
    () => {
        void fetchActivities()
    }
)

const activityList = computed(() => activities.value?.data || [])
const totalActivities = computed(() => activities.value?.total || 0)

function onPageChange(event: any): void {
    currentPage.value = event.page + 1
}
</script>

<template>
    <BaseWidgetContainer :title="t('views.member.activities.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <div v-if="activityList.length > 0" class="space-y-3">
            <div
                v-for="activity in activityList"
                :key="activity.activity_id"
                class="p-3 rounded-2xl bg-surface-100 hover:bg-surface-200 transition-colors cursor-pointer"
            >
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="font-medium">{{ activity.activity_name }}</div>
                        <div class="text-xs text-gray-500">
                            {{ activity.total_sessions }}
                            {{ t('views.member.activities.sessions') }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary-500">
                            {{ formatMinutesToLabel(activity.total_duration) }}
                        </div>
                        <div v-if="activity.skill_level" class="text-xs text-gray-500">
                            {{ activity.skill_level }}
                        </div>
                    </div>
                </div>
            </div>
            <Paginator
                :first="first"
                :rows="pageSize"
                :total-records="totalActivities"
                @page="onPageChange"
                class="mt-4"
            />
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
