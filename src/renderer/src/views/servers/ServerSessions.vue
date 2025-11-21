<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SessionFilterBar from '@/components/sessions/SessionFilterBar.vue'
import SessionCardGrid from '@/components/sessions/SessionCardGrid.vue'
import { onMounted, ref } from 'vue'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import { useActivitySearch } from '@/composables/activities/useActivitySearch'
import { useServerStore } from '@/stores/server'
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { usePaginatedFetcher } from '@/composables/usePaginatedFetcher'

const i18n = useI18n()
const { listSessions, likeSession, unlikeSession } = useSessionCRUD()
const server_store = useServerStore()

// Activity search composable
const {
    activityQuery: filter_activityQuery,
    activitySuggestions: filter_activitySuggestions,
    selectedActivityId: filter_selectedActivityId,
    searchActivities,
    onActivityQueryChange
} = useActivitySearch()
const filter_startDate = ref<Date | undefined>(undefined)
const filter_endDate = ref<Date | undefined>(undefined)
const filter_minDuration = ref<number | undefined>(undefined)
const filter_maxDuration = ref<number | undefined>(undefined)
const filter_likedByMe = ref<boolean | undefined>(undefined)

const mock_sessions = ref<ISessionListItem[]>([
    {
        creator: {
            member_public_id: 'member-001',
            nickname: 'johndoe',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png'
        },
        activity: {
            name: 'Morning Run',
            public_id: 'activity-123',
            logo: 'https://cdn2.steamgriddb.com/icon_thumb/12bb430be526cebb26b7248683b51fab.png',
            banner: 'https://cdn2.steamgriddb.com/hero_thumb/ae23fc20a0346df4e0b9594aefb7c26d.jpg'
        },
        public_id: 'session-001',
        server_member: [
            {
                public_id: 'member-001',
                nickname: 'johndoe',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png'
            },
            {
                public_id: 'member-002',
                nickname: 'janedoe',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            },
            {
                public_id: 'member-003',
                nickname: 'alice',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png'
            },
            {
                public_id: 'member-004',
                nickname: 'bob',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/1326/1326377.png'
            }
        ],
        date: new Date('2023-10-01T06:30:00Z').toLocaleDateString(),
        duration: '3600',
        liked_by_me: false,
        likes_count: 5,
        participants_count: 5,
        title: 'A morning run with friends'
    },
    {
        creator: {
            member_public_id: 'member-002',
            nickname: 'janedoe',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        },
        activity: {
            name: 'Evening Cycle',
            public_id: 'activity-456',
            banner: 'https://cdn2.steamgriddb.com/hero_thumb/e1c21364530057bc884be07f32491acc.jpg'
        },
        public_id: 'session-002',
        server_member: [
            {
                public_id: 'member-005',
                nickname: 'charlie',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/1999/1999625.png'
            },
            {
                public_id: 'member-006',
                nickname: 'dave',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png'
            }
        ],
        date: new Date('2023-10-02T18:00:00Z').toLocaleDateString(),
        duration: '5400',
        liked_by_me: true,
        likes_count: 8,
        participants_count: 3,
        title: 'An evening cycle with friends'
    },
    {
        creator: {
            member_public_id: 'member-003',
            nickname: 'alice',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png'
        },
        activity: {
            name: 'Weekend Hike',
            public_id: 'activity-789'
        },
        public_id: 'session-003',
        server_member: [
            {
                public_id: 'member-007',
                nickname: 'eve',
                avatar_url: 'https://example.com/avatars/eve.png'
            }
        ],
        date: new Date('2023-10-03T09:00:00Z').toLocaleDateString(),
        duration: '7200',
        liked_by_me: false,
        likes_count: 2,
        participants_count: 1,
        title: ''
    },
    {
        creator: {
            member_public_id: 'member-004',
            nickname: 'bob',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/1326/1326377.png'
        },
        activity: {
            name: 'Lunch Walk',
            public_id: 'activity-101'
        },
        public_id: 'session-004',
        server_member: [
            {
                public_id: 'member-008',
                nickname: 'frank',
                avatar_url: 'https://example.com/avatars/frank.png'
            },
            {
                public_id: 'member-009',
                nickname: 'grace',
                avatar_url: 'https://example.com/avatars/grace.png'
            }
        ],
        date: new Date('2023-10-04T12:30:00Z').toLocaleDateString(),
        duration: '1800',
        liked_by_me: true,
        likes_count: 4,
        participants_count: 2,
        title: 'A lunch walk with friends'
    }
])

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
            liked_by_me: filter_likedByMe.value
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
        filter_activityQuery,
        filter_selectedActivityId,
        filter_startDate,
        filter_endDate,
        filter_minDuration,
        filter_maxDuration,
        filter_likedByMe
    ]
})

async function onLikeSession(sessionId: string): Promise<void> {
    if (!server_store.getPublicId) return

    const res = await likeSession(server_store.getPublicId, sessionId)
    if (!res.error) {
        // Update the local session to reflect the like
        const session = sessions.value.find((s) => s.public_id === sessionId)
        if (session) {
            session.liked_by_me = true
            session.likes_count += 1
        }
    }
}

async function onUnlikeSession(sessionId: string): Promise<void> {
    if (!server_store.getPublicId) return

    const res = await unlikeSession(server_store.getPublicId, sessionId)
    if (!res.error) {
        // Update the local session to reflect the unlike
        const session = sessions.value.find((s) => s.public_id === sessionId)
        if (session) {
            session.liked_by_me = false
            session.likes_count -= 1
        }
    }
}

onMounted(() => {
    load()
})
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('userInterface.serverSessionsView.title') || 'Sessions' }}
            </h2>
        </div>

        <div class="w-full px-2 pb-2">
            <SessionFilterBar
                :activity-query="filter_activityQuery"
                :activity-suggestions="filter_activitySuggestions"
                :start-date="filter_startDate"
                :end-date="filter_endDate"
                :min-duration="filter_minDuration"
                :max-duration="filter_maxDuration"
                :liked-by-me="filter_likedByMe"
                :count="sessions.length"
                @update:activity-query="onActivityQueryChange"
                @search-activity="searchActivities"
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
                :sessions="mock_sessions"
                :loading="loading"
                @like="onLikeSession"
                @unlike="onUnlikeSession"
                @load-more="loadMore"
            />
        </div>
    </div>
</template>

<style scoped>
/* Additional session-specific styling if needed */
</style>
