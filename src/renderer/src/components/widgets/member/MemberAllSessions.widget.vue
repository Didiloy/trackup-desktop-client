<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { formatMinutesToLabel } from '@/utils/time.utils'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-all-sessions',
        title_key: 'widgets.member.all_sessions.title',
        icon: 'pi pi-list',
        description_key: 'widgets.member.all_sessions.description',
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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const server_store = useServerStore()
const { getMemberSessions } = useMemberCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const sessions = ref<ISessionListItem[]>([])
const total = ref(0)
const first = ref(0)
const pageSize = 10
const isLoading = ref(false)

async function loadSessions(page = 0): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberSessions(serverId, memberId.value, {
            page: page + 1,
            limit: pageSize
        })
        if (res.data) {
            sessions.value = res.data.data
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
        void loadSessions(0)
    },
    { immediate: true }
)

const onPageChange = (event: { first: number; page: number }): void => {
    first.value = event.first
    void loadSessions(event.page)
}

const navigateToSession = async (sessionId: string): Promise<void> => {
    await router.push({
        name: 'SessionDetails',
        params: {
            id: server_store.getPublicId,
            sessionId
        }
    })
}
</script>

<template>
    <BaseWidgetContainer :title="t('widgets.member.all_sessions.title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />

        <div
            v-if="sessions.length === 0 && !isLoading"
            class="flex items-center justify-center h-64"
        >
            <p class="text-surface-400">{{ t('common.fields.no_data') }}</p>
        </div>

        <div v-else class="flex flex-col h-full">
            <div class="flex-1 overflow-y-auto pr-2 space-y-0.5">
                <div
                    v-for="session in sessions"
                    :key="session.public_id"
                    class="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-all cursor-pointer border-b border-surface-50 last:border-0"
                    @click="navigateToSession(session.public_id)"
                >
                    <!-- Date Box -->
                    <div
                        class="flex flex-col items-center justify-center w-14 h-14 bg-surface-100 rounded-xl text-surface-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shrink-0"
                    >
                        <span class="text-lg font-bold leading-none">{{
                            new Date(session.date).getDate()
                        }}</span>
                        <span class="text-[0.65rem] font-bold uppercase tracking-wider">{{
                            new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })
                        }}</span>
                    </div>

                    <!-- Main Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="font-bold text-surface-900 truncate">
                                {{ session.title || session.activity?.name || '-' }}
                            </h4>
                            <span
                                v-if="session.activity?.name"
                                class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-200 text-surface-600 uppercase tracking-wide"
                            >
                                {{ session.activity.name }}
                            </span>
                        </div>

                        <div class="flex items-center gap-4 text-xs text-surface-500">
                            <!-- Duration -->
                            <div class="flex items-center gap-1.5 font-medium text-surface-900">
                                <i class="pi pi-clock text-primary-500"></i>
                                <span>{{ formatMinutesToLabel(parseInt(session.duration)) }}</span>
                            </div>

                            <!-- Participants -->
                            <div
                                v-if="session.participants_count > 0"
                                class="flex items-center gap-1.5"
                            >
                                <i class="pi pi-users"></i>
                                <span>{{ session.participants_count }}</span>
                            </div>

                            <!-- Likes -->
                            <div v-if="session.likes_count > 0" class="flex items-center gap-1.5">
                                <i
                                    :class="[
                                        'pi',
                                        session.liked_by_me
                                            ? 'pi-heart-fill text-pink-500'
                                            : 'pi-heart'
                                    ]"
                                ></i>
                                <span :class="{ 'font-bold text-pink-600': session.liked_by_me }">{{
                                    session.likes_count
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Chevron -->
                    <i
                        class="pi pi-chevron-right text-surface-300 group-hover:text-primary-500 transition-colors"
                    ></i>
                </div>
            </div>

            <Paginator
                v-if="total > pageSize"
                :first="first"
                :rows="pageSize"
                :total-records="total"
                class="mt-4 border-t border-surface-100 pt-2"
                @page="onPageChange"
            />
        </div>
    </BaseWidgetContainer>
</template>
