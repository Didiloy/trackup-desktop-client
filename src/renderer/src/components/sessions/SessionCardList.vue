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
        <div v-if="loading && sessions.length === 0" class="flex flex-col items-center justify-center h-full min-h-[400px]">
            <i class="pi pi-spin pi-spinner text-5xl text-primary-500"></i>
            <p class="text-surface-600 mt-4">Loading sessions...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="isEmpty" class="flex flex-col items-center justify-center h-full min-h-[400px]">
            <i class="pi pi-calendar text-7xl text-surface-300 mb-4"></i>
            <p class="text-xl font-medium text-surface-600">No sessions found</p>
            <p class="text-sm text-surface-500 mt-2">Try adjusting your filters</p>
        </div>

        <!-- Sessions Grid -->
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8">
            <div
                v-for="session in sessions"
                :key="session.public_id"
                class="relative bg-white border border-surface-200 rounded-2xl p-6 flex flex-col gap-5 overflow-hidden shadow-sm hover:cursor-pointer hover:shadow-lg transition-all duration-250 hover:-translate-y-0.5 hover:border-primary-200"
            >
                <!-- Card Header with Date & Duration -->
                <div class="flex justify-between items-center pt-1">
                    <div class="flex items-center gap-2 text-surface-700 text-sm">
                        <i class="pi pi-calendar text-primary-500 text-base"></i>
                        <span class="font-medium">{{ formatDate(session.date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 px-3.5 py-2 rounded-full text-sm font-semibold border border-primary-200">
                        <i class="pi pi-clock text-sm"></i>
                        <span>{{ formatDuration(session.duration) }}</span>
                    </div>
                </div>

    

                <!-- Activity Info with Banner Background -->
                <div class="relative -mx-2 rounded-2xl overflow-hidden shadow-lg">
                    <!-- Banner Background with Blur -->
                    <div
                        v-if="session.activity.banner"
                        class="absolute inset-0 bg-cover bg-center blur-[1px] scale-110 rounded-2xl"
                        :style="{ backgroundImage: `url(${session.activity.banner})` }"
                    ></div>
                    <!-- Dark Overlay for readability -->
                    <div
                        v-if="session.activity.banner"
                        class="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl"
                    ></div>

                    <!-- Content -->
                    <div class="relative flex items-center gap-3.5 py-4 px-4">
                        <img
                            v-if="session.activity.logo"
                            :src="session.activity.logo"
                            :alt="session.activity.name"
                            class="w-[52px] h-[52px] rounded-[14px] object-cover shadow-2xl ring-2 ring-white/50"
                        />
                        <div v-else class="w-[52px] h-[52px] rounded-[14px] overflow-hidden shrink-0 shadow-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-white/50">
                            {{ session.activity.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="text-lg font-bold leading-relaxed" :class="session.activity.banner ? 'text-white drop-shadow-lg' : 'text-surface-900'">
                            {{ session.activity.name }}
                        </div>
                    </div>
                </div>

                <!-- Participants -->
                <div class="flex flex-col gap-2.5">
                    <div class="flex items-center">
                        <div
                            v-for="(participant, idx) in session.server_member.slice(0, 4)"
                            :key="participant.public_id"
                            class="w-10 h-10 rounded-full border-[3px] border-white overflow-hidden first:ml-0 -ml-2.5 bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:!z-[100] shadow-md hover:shadow-xl"
                            :style="{ zIndex: 10 - idx }"
                        >
                            <img
                                v-if="participant.avatar"
                                :src="participant.avatar"
                                :alt="participant.nickname"
                                v-tooltip.top="participant.nickname"
                                class="w-full h-full object-cover"
                            />
                            <span v-else v-tooltip.top="participant.nickname">
                                {{ participant.nickname.charAt(0).toUpperCase() }}
                            </span>
                        </div>
                        <div
                            v-if="session.participants_count > 4"
                            class="w-10 h-10 rounded-full border-[3px] border-white -ml-2.5 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md"
                        >
                            <span>+{{ session.participants_count - 4 }}</span>
                        </div>
                    </div>
                    <span class="text-sm text-surface-600 font-medium">
                        {{ session.participants_count }}
                        {{ session.participants_count === 1 ? 'participant' : 'participants' }}
                    </span>
                </div>

                <!-- Footer with Like Button -->
                <div class="flex justify-end pt-2">
                    <Button
                        :icon="session.liked_by_me ? 'pi pi-heart-fill' : 'pi pi-heart'"
                        :label="session.likes_count.toString()"
                        :severity="session.liked_by_me ? 'danger' : 'secondary'"
                        :outlined="!session.liked_by_me"
                        size="small"
                        @click="toggleLike(session)"
                    />
                </div>
            </div>

            <!-- Load More Trigger -->
            <div
                v-if="sessions.length > 0"
                ref="loadMoreTrigger"
                class="col-span-full flex justify-center p-6"
            >
                <div v-if="loading" class="p-4">
                    <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
                </div>
            </div>
        </div>
    </div>
</template>

