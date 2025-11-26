<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SessionFilterBar from '@/components/sessions/SessionFilterBar.vue'
import SessionCardGrid from '@/components/sessions/SessionCardGrid.vue'
import { onMounted, ref } from 'vue'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import { useServerStore } from '@/stores/server'
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { usePaginatedFetcher } from '@/composables/usePaginatedFetcher'
import SessionCreateDialog from '@/components/sessions/create/SessionCreateDialog.vue'
import { useDebounceFn } from '@vueuse/core'

const i18n = useI18n()
const { listSessions, likeSession, unlikeSession } = useSessionCRUD()
const server_store = useServerStore()

// Activity search state
const filter_activityQuery = ref('')
const filter_selectedActivityId = ref<string | undefined>(undefined)

const filter_startDate = ref<Date | undefined>(undefined)
const filter_endDate = ref<Date | undefined>(undefined)
const filter_minDuration = ref<number | undefined>(undefined)
const filter_maxDuration = ref<number | undefined>(undefined)
const filter_likedByMe = ref<boolean | undefined>(undefined)
const filter_participantIds = ref<string[]>([])
const show_create_session_dialog = ref(false)

/**
 * Composable for fetch + pagination
 */
const {
    items: sessions,
    loading,
    error,
    load,
    loadMore
} = usePaginatedFetcher<ISessionListItem>({
    fetcher: async ({ page, limit }) => {
        if (!server_store.getPublicId) {
            return { data: [], total: 0, error: 'No server selected' }
        }

        const res = await listSessions(server_store.getPublicId, {
            page,
            limit,
            activity_id: filter_selectedActivityId.value,
            start_date: filter_startDate.value?.toISOString().split('T')[0],
            end_date: filter_endDate.value?.toISOString().split('T')[0],
            min_duration: filter_minDuration.value,
            max_duration: filter_maxDuration.value,
            liked_by_me: filter_likedByMe.value || undefined,
            participant_ids:
                filter_participantIds.value.length > 0
                    ? filter_participantIds.value.join(',')
                    : undefined
        })

        if (res.error) {
            return { data: [], total: 0, error: res.error }
        }

        return {
            data: res.data?.data ?? [],
            total: res.data?.total ?? 0
        }
    },
    limit: 20,
    filters: [
        filter_selectedActivityId,
        filter_startDate,
        filter_endDate,
        filter_minDuration,
        filter_maxDuration,
        filter_likedByMe,
        filter_participantIds
    ]
})

// Debounced like/unlike handlers to prevent API spam
const onLikeSession = useDebounceFn(async (sessionId: string): Promise<void> => {
    const serverId = server_store.getPublicId
    if (!serverId) return

    const res = await likeSession(serverId, sessionId)
    if (!res.error) {
        // Update the local session to reflect the like
        const session = sessions.value.find((s) => s.public_id === sessionId)
        if (session) {
            session.liked_by_me = true
            session.likes_count += 1
        }
    }
}, 500)

const onUnlikeSession = useDebounceFn(async (sessionId: string): Promise<void> => {
    const serverId = server_store.getPublicId
    if (!serverId) return

    const res = await unlikeSession(serverId, sessionId)
    if (!res.error) {
        // Update the local session to reflect the unlike
        const session = sessions.value.find((s) => s.public_id === sessionId)
        if (session) {
            session.liked_by_me = false
            session.likes_count -= 1
        }
    }
}, 500)

onMounted(() => {
    load()
})
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('userInterface.serverSessionsView.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="i18n.t('userInterface.serverSessionsView.addSessionModal.title')"
                    size="small"
                    @click="show_create_session_dialog = true"
                />
            </div>
        </div>

        <div class="w-full px-2 pb-2">
            <SessionFilterBar
                :activity-query="filter_activityQuery"
                :participant-ids="filter_participantIds"
                :start-date="filter_startDate"
                :end-date="filter_endDate"
                :min-duration="filter_minDuration"
                :max-duration="filter_maxDuration"
                :liked-by-me="filter_likedByMe"
                :count="sessions.length"
                @update:activity-query="(v) => (filter_activityQuery = v)"
                @select-activity="(a) => (filter_selectedActivityId = a?.public_id)"
                @update:participant-ids="(v) => (filter_participantIds = v)"
                @update:start-date="(v) => (filter_startDate = v)"
                @update:end-date="(v) => (filter_endDate = v)"
                @update:min-duration="(v) => (filter_minDuration = v)"
                @update:max-duration="(v) => (filter_maxDuration = v)"
                @update:liked-by-me="(v) => (filter_likedByMe = v)"
            />
        </div>

        <div v-if="error" class="w-full px-2 pb-2">
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                {{ error }}
            </div>
        </div>

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <SessionCardGrid
                :sessions="sessions"
                :loading="loading"
                @like="onLikeSession"
                @unlike="onUnlikeSession"
                @load-more="loadMore"
            />
        </div>
        <SessionCreateDialog v-model="show_create_session_dialog" @created="load" />
    </div>
</template>

<style scoped>
/* Additional session-specific styling if needed */
</style>
