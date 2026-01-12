<script setup lang="ts">
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { computed } from 'vue'
import SessionCard from '@/components/sessions/SessionCard.vue'
import InfiniteScrollContainer from '@/components/common/InfiniteScrollContainer.vue'
import { useI18n } from 'vue-i18n'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'

const { t } = useI18n()

interface Props {
    sessions: ISessionListItem[]
    loading?: boolean
    hasMore?: boolean
}

interface Emits {
    (e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    hasMore: true
})
const emit = defineEmits<Emits>()

const isEmpty = computed(() => props.sessions.length === 0 && !props.loading)
</script>

<template>
    <InfiniteScrollContainer
        :loading="loading"
        :has-more="hasMore"
        container-class="p-2"
        @load-more="emit('load-more')"
    >
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
            <SessionIcon class="text-7xl text-surface-300 mb-4" />
            <p class="text-xl font-medium text-surface-600">{{ t('common.filters.no_results') }}</p>
            <p class="text-sm text-surface-500 mt-2">{{ t('common.filters.try_adjusting') }}</p>
        </div>
    </InfiniteScrollContainer>
</template>
