<script setup lang="ts">
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { computed, ref } from 'vue'

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

const loadMoreTrigger = ref<HTMLElement | null>(null)

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
            <div
                v-for="session in sessions"
                :key="session.public_id"
                class="group relative bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                @click="() => {}"
            >
                <!-- Banner -->
                <div class="relative h-40 w-full overflow-hidden">
                    <img
                        v-if="session.activity.banner"
                        :src="session.activity.banner"
                        :alt="session.activity.name"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <!-- Gradient overlay -->
                    <div
                        class="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60"
                        v-if="session.activity.banner"
                    ></div>

                    <!-- Logo + Title -->
                    <div class="absolute bottom-4 left-4 flex items-center gap-3">
                        <img
                            v-if="session.activity.logo"
                            :src="session.activity.logo"
                            class="w-12 h-12 rounded-xl object-cover shadow-lg ring-1 ring-black/20"
                        />
                        <div
                            v-else
                            class="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center text-lg font-bold text-surface-700 shadow-lg ring-1 ring-black/20"
                        >
                            {{ session.activity.name.charAt(0).toUpperCase() }}
                        </div>

                        <h3
                            class="text-lg font-semibold drop-shadow"
                            :class="session.activity.banner ? 'text-white' : 'text-surface-900'"
                        >
                            {{ session.activity.name }}
                        </h3>
                    </div>
                </div>

                <!-- Body -->
                <div class="p-5 flex flex-col gap-4">
                    <!-- Meta: duration + date -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-surface-700 font-medium">
                            <i class="pi pi-clock text-primary-500"></i>
                            <span>{{ formatDuration(session.duration) }}</span>
                        </div>

                        <div class="flex items-center gap-2 text-surface-600 font-medium">
                            <i class="pi pi-calendar text-primary-500"></i>
                            <span>{{ formatDate(session.date) }}</span>
                        </div>
                    </div>

                    <!-- Participants -->
                </div>

                <!-- Footer -->
                <div class="p-5 pt-0 flex justify-between items-end">
                    <div>
                        <div class="flex -space-x-3">
                            <div
                                v-for="(participant, idx) in session.server_member.slice(0, 4)"
                                :key="participant.public_id"
                                class="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-200 shadow-sm"
                            >
                                <img
                                    v-if="participant.avatar"
                                    :src="participant.avatar"
                                    class="w-full h-full object-cover"
                                />
                                <span
                                    v-else
                                    class="flex items-center justify-center w-full h-full font-semibold text-surface-700"
                                >
                                    {{ participant.nickname.charAt(0).toUpperCase() }}
                                </span>
                            </div>

                            <div
                                v-if="session.participants_count > 4"
                                class="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-white shadow-sm"
                            >
                                +{{ session.participants_count - 4 }}
                            </div>
                        </div>

                        <p class="text-sm text-surface-600 mt-2">
                            {{ session.participants_count }}
                            {{ session.participants_count === 1 ? 'participant' : 'participants' }}
                        </p>
                    </div>
                    <Button
                        :icon="session.liked_by_me ? 'pi pi-heart-fill' : 'pi pi-heart'"
                        :label="session.likes_count.toString()"
                        :severity="session.liked_by_me ? 'danger' : 'secondary'"
                        :outlined="!session.liked_by_me"
                        size="small"
                        class="!px-4 !py-2 h-fit"
                        @click.stop="toggleLike(session)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
