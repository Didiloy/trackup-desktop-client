<script setup lang="ts">
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionCard from '@/components/sessions/SessionCard.vue'

interface Props {
    sessions: ISessionListItem[]
    loading?: boolean
}

interface Emits {
    (e: 'like', sessionId: string): void
    (e: 'unlike', sessionId: string): void
    (e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})
const emit = defineEmits<Emits>()
const { t } = useI18n()

function formatDuration(duration: string): string {
    const seconds = parseInt(duration)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString()
}

function toggleLike(session: ISessionListItem): void {
    if (session.liked_by_me) {
        emit('unlike', session.public_id)
    } else {
        emit('like', session.public_id)
    }
}

function handleScroll(event: Event): void {
    const target = event.target as HTMLElement | null
    if (!target) return
    const { scrollTop, clientHeight, scrollHeight } = target
    const threshold = 200
    if (scrollTop + clientHeight + threshold >= scrollHeight) {
        emit('load-more')
    }
}

const isEmpty = computed(() => props.sessions.length === 0 && !props.loading)

function getParticipantTooltip(
    participant: ISessionListItem['server_member'][number],
    session: ISessionListItem
): string {
    const isCreator = participant.public_id === session.creator.member_public_id
    return isCreator ? `${participant.nickname} • ${t('common.creator')}` : participant.nickname
}
</script>

<template>
    <div class="w-full h-full overflow-y-auto p-2" @scroll.passive="handleScroll">
        <!-- Loading State -->
        <div
            v-if="loading && sessions.length === 0"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <i class="pi pi-spin pi-spinner text-5xl text-primary-500"></i>
            <p class="text-surface-600 mt-4">Loading sessions...</p>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <i class="pi pi-calendar text-7xl text-surface-300 mb-4"></i>
            <p class="text-xl font-medium text-surface-600">No sessions found</p>
            <p class="text-sm text-surface-500 mt-2">Try adjusting your filters</p>
        </div>

        <!-- Sessions Grid -->
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8">
            <SessionCard
                v-for="session in sessions"
                :key="session.public_id"
                :session="session"
                @like="toggleLike(session)"
                @unlike="toggleLike(session)"
            />
        </div>
    </div>
</template>
