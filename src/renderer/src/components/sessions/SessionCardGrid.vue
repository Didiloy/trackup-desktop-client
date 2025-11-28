<script setup lang="ts">
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { computed } from 'vue'
import SessionCard from '@/components/sessions/SessionCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
        <!-- Sessions Grid -->
        <TransitionGroup
            name="fade"
            tag="div"
            class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8"
        >
            <SessionCard
                v-for="session in sessions"
                :key="session.public_id"
                :session="session"
                @like="toggleLike(session)"
                @unlike="toggleLike(session)"
            />
        </TransitionGroup>

        <!-- Loading State -->
        <div
            v-if="loading && sessions.length === 0"
            class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8"
        >
            <div
                v-for="n in 6"
                :key="n"
                class="group relative rounded-2xl border border-surface-200 shadow-sm overflow-hidden"
            >
                <!-- Skeleton Banner -->
                <div class="h-20 bg-surface-200 animate-pulse"></div>

                <!-- Skeleton Body -->
                <div class="p-5 flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-surface-200 animate-pulse rounded"></div>
                            <div class="w-16 h-4 bg-surface-200 animate-pulse rounded"></div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-surface-200 animate-pulse rounded"></div>
                            <div class="w-16 h-4 bg-surface-200 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>

                <!-- Skeleton Footer -->
                <div class="p-5 pt-0 flex justify-between items-end">
                    <div>
                        <div class="flex -space-x-3">
                            <div
                                v-for="i in 4"
                                :key="i"
                                class="w-10 h-10 rounded-full bg-surface-200 animate-pulse"
                            ></div>
                        </div>
                        <div class="w-20 h-4 bg-surface-200 animate-pulse rounded mt-2"></div>
                    </div>
                    <div class="w-12 h-8 bg-surface-200 animate-pulse rounded"></div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <i class="pi pi-calendar text-7xl text-surface-300 mb-4"></i>
            <p class="text-xl font-medium text-surface-600">{{ t('filters.no_results') }}</p>
            <p class="text-sm text-surface-500 mt-2">{{ t('filters.try_adjusting') }}</p>
        </div>


    </div>
</template>
