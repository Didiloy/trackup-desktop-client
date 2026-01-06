<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberActivityWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IPaginatedSessions } from '@shared/contracts/interfaces/entities/session.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { formatMinutesToLabel } from '@/utils/time.utils'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'
import ActivityIdentityCorner from '@/components/activities/profile/ActivityIdentityCorner.vue'
import { formatDate } from '@/utils'

defineOptions({
    widgetMetadata: {
        id: 'member-activity-sessions',
        title_key: 'widgets.member_activity.sessions.title',
        icon: 'pi pi-th-large',
        description_key: 'widgets.member_activity.sessions.description',
        category: {
            key: EWidgetCategory.MemberActivities,
            label_key: 'widgets.categories.member_activity'
        },
        defaultSize: { w: 4, h: 10, minW: 4, minH: 10 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

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
const router = useRouter()
const server_store = useServerStore()
const { getMemberSessionsForActivity } = useMemberCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const activityId = computed(() => props.config?.activityId)
const sessions = ref<IPaginatedSessions | null>(null)
const isLoading = ref(false)
const first = ref(0)
const pageSize = ref(10)

async function fetchSessions(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId || !activityId.value) return

    isLoading.value = true
    try {
        const page = Math.floor(first.value / pageSize.value) + 1
        const res = await getMemberSessionsForActivity(serverId, memberId.value, activityId.value, {
            page,
            limit: pageSize.value
        })
        if (res.data) {
            sessions.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchSessions()
})

watch(
    () => [server_store.getPublicId, memberId.value, activityId.value, first.value],
    () => {
        void fetchSessions()
    }
)

const sessionList = computed(() => sessions.value?.data || [])
const totalSessions = computed(() => sessions.value?.total || 0)
const activityName = computed(() => sessionList.value[0]?.activity?.name)

async function navigateToSession(sessionId: string): Promise<void> {
    await router.push({
        name: 'ServerSessionProfile',
        params: {
            serverId: server_store.getPublicId,
            sessionId
        }
    })
}
</script>

<template>
    <BaseWidgetContainer
        :title="t('views.server_members.sessions.activity_title', { activity: activityName ?? '' })"
        :loading="isLoading"
    >
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <ActivityIdentityCorner
            :show="props.showIdentity"
            :activity-id="activityId"
            class="top-4 right-[130px]"
        />
        <div v-if="sessionList.length > 0" class="space-y-2">
            <div
                v-for="session in sessionList"
                :key="session.public_id"
                class="p-3 rounded-2xl bg-surface-100 hover:bg-surface-200 transition-colors cursor-pointer border border-surface-200"
                @click="navigateToSession(session.public_id)"
            >
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="text-xs text-gray-500">
                            {{ formatDate(session.date) }}
                        </div>
                        <div v-if="session.title" class="text-sm font-medium mt-1">
                            {{ session.title }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary-500">
                            {{ formatMinutesToLabel(parseInt(session.duration)) }}
                        </div>
                    </div>
                </div>
            </div>
            <Paginator v-model:first="first" :rows="pageSize" :total-records="totalSessions" />
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.fields.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
