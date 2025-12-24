<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IPaginatedSessions } from '@shared/contracts/interfaces/entities/session.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import { formatMinutesToLabel } from '@/utils/time.utils'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-all-sessions',
        title: 'Toutes les Sessions',
        icon: 'pi pi-list',
        description: 'Affiche toutes les sessions du membre',
        category: {
            key: EWidgetCategory.Member,
            label: 'Member'
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
const { getMemberSessions } = useMemberCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const sessions = ref<IPaginatedSessions | null>(null)
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

async function fetchSessions(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberSessions(serverId, memberId.value, {
            page: currentPage.value,
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
    () => [server_store.getPublicId, memberId.value, currentPage.value],
    () => {
        void fetchSessions()
    }
)

const sessionList = computed(() => sessions.value?.data || [])
const totalSessions = computed(() => sessions.value?.total || 0)
</script>

<template>
    <BaseWidgetContainer :title="t('views.member.sessions.all_title')" :loading="isLoading">
        <MemberIdentityCorner :show="props.showIdentity" :member-id="memberId" />
        <div v-if="sessionList.length > 0" class="space-y-3">
            <div
                v-for="session in sessionList"
                :key="session.public_id"
                class="p-3 rounded-2xl bg-surface-100 hover:bg-surface-200 transition-colors"
            >
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="font-medium">{{ session.activity?.name }}</div>
                        <div class="text-xs text-gray-500">
                            {{ new Date(session.date).toLocaleDateString() }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary-500">
                            {{ formatMinutesToLabel(parseInt(session.duration)) }}
                        </div>
                    </div>
                </div>
            </div>
            <Paginator
                v-model:first="currentPage"
                :rows="pageSize"
                :total-records="totalSessions"
                class="mt-4"
            />
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
