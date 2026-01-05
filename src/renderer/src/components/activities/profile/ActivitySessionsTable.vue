<script setup lang="ts">
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils'
import InfiniteScrollContainer from '@/components/common/InfiniteScrollContainer.vue'
import { computed } from 'vue'
import TransitionGroupWrapper from '@/components/common/transitions/TransitionGroupWrapper.vue'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'

const { t } = useI18n()
const server_store = useServerStore()
const router = useRouter()

interface Props {
    sessions: IActivitySessionListItem[]
    loading?: boolean
    hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    hasMore: true
})

const emit = defineEmits<{
    (e: 'loadMore'): void
}>()

async function navigateToSession(sessionId: string): Promise<void> {
    await router.push({
        name: 'ServerSessionProfile',
        params: {
            id: server_store.getPublicId,
            sessionId
        }
    })
}

const isEmpty = computed(() => props.sessions.length === 0 && !props.loading)
</script>

<template>
    <InfiniteScrollContainer
        :loading="loading"
        :has-more="hasMore"
        container-class="p-0"
        @load-more="emit('loadMore')"
    >
        <!-- Sessions Grid -->
        <TransitionGroupWrapper
            name="fade"
            tag="div"
            class="flex flex-col gap-4 pb-4"
        >
            <div
                v-for="session in sessions"
                :key="session.public_id"
                class="group relative w-full rounded-2xl border border-surface-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                @click="navigateToSession(session.public_id)"
            >
                <!-- Header -->
                <div class="px-5 pt-5 pb-3">
                    <h3 class="text-lg font-semibold text-surface-900 truncate">
                        {{ session.title || t('common.fields.no_title') }}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-surface-600 mt-1">
                        <i class="pi pi-calendar text-xs"></i>
                        <span>{{ formatDate(session.date) }}</span>
                    </div>
                </div>

                <!-- Body -->
                <div class="px-5 pb-4">
                    <!-- Stats Row -->
                    <div class="flex items-center gap-4 flex-wrap">
                        <!-- Duration -->
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700"
                        >
                            <i class="pi pi-clock text-xs"></i>
                            <span class="text-sm font-medium">{{
                                formatMinutesToLabel(session.duration as unknown as number)
                            }}</span>
                        </div>

                        <!-- Participants -->
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700"
                        >
                            <MemberIcon/>
                            <span class="text-sm font-medium">{{ session.participants_count }}</span>
                        </div>

                        <!-- Likes -->
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 text-pink-700"
                        >
                            <i class="pi pi-heart text-xs"></i>
                            <span class="text-sm font-medium">{{ session.likes_count }}</span>
                        </div>
                    </div>
                </div>

                <!-- Hover indicator -->
                <div
                    class="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
            </div>
        </TransitionGroupWrapper>

        <!-- Loading State -->
        <div
            v-if="loading && sessions.length === 0"
            class="flex flex-col gap-4 pb-4"
        >
            <div
                v-for="n in 6"
                :key="n"
                class="w-full rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden"
            >
                <div class="px-5 pt-5 pb-3">
                    <div class="w-3/4 h-6 bg-surface-200 animate-pulse rounded"></div>
                    <div class="w-1/2 h-4 bg-surface-200 animate-pulse rounded mt-2"></div>
                </div>
                <div class="px-5 pb-4">
                    <div class="flex items-center gap-4">
                        <div class="w-20 h-8 bg-surface-200 animate-pulse rounded-full"></div>
                        <div class="w-16 h-8 bg-surface-200 animate-pulse rounded-full"></div>
                        <div class="w-16 h-8 bg-surface-200 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <i class="pi pi-calendar text-7xl text-surface-300 mb-4"></i>
            <p class="text-xl font-medium text-surface-600">
                {{ t('views.server_activities.sessions_tab.empty_state') }}
            </p>
        </div>
    </InfiniteScrollContainer>
</template>

<style scoped>

</style>
