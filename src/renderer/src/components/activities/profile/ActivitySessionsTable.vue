<script setup lang="ts">
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { useServerStore } from '@/stores/server'
import { useRouter } from 'vue-router'
import InfiniteScrollContainer from '@/components/common/InfiniteScrollContainer.vue'
import { computed } from 'vue'
import TransitionGroupWrapper from '@/components/common/transitions/TransitionGroupWrapper.vue'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'

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
        <!-- Sessions List -->
        <TransitionGroupWrapper
            name="fade"
            tag="div"
            class="flex flex-col"
        >
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
                    <h3 class="font-bold text-surface-900 truncate mb-1">
                        {{ session.title || t('common.fields.no_title') }}
                    </h3>

                    <div class="flex items-center gap-4 text-xs text-surface-500">
                        <!-- Duration -->
                        <div class="flex items-center gap-1.5 font-medium text-surface-900">
                            <i class="pi pi-clock text-primary-500"></i>
                            <span>{{
                                formatMinutesToLabel(session.duration as unknown as number)
                            }}</span>
                        </div>

                        <!-- Participants -->
                        <div
                            v-if="session.participants_count > 0"
                            class="flex items-center gap-1.5"
                        >
                            <MemberIcon />
                            <span>{{ session.participants_count }}</span>
                        </div>

                        <!-- Likes -->
                        <div v-if="session.likes_count > 0" class="flex items-center gap-1.5">
                            <i class="pi pi-heart"></i>
                            <span>{{ session.likes_count }}</span>
                        </div>
                    </div>
                </div>

                <!-- Chevron -->
                <i
                    class="pi pi-chevron-right text-surface-300 group-hover:text-primary-500 transition-colors"
                ></i>
            </div>
        </TransitionGroupWrapper>

        <!-- Loading State -->
        <div
            v-if="loading && sessions.length === 0"
            class="flex flex-col"
        >
            <div
                v-for="n in 6"
                :key="n"
                class="flex items-center gap-4 p-3 border-b border-surface-50 last:border-0"
            >
                <!-- Date Box Skeleton -->
                <div class="w-14 h-14 bg-surface-100 rounded-xl animate-pulse shrink-0"></div>

                <!-- Content Skeleton -->
                <div class="flex-1 min-w-0 space-y-2">
                    <div class="w-1/3 h-5 bg-surface-100 rounded animate-pulse"></div>
                    <div class="flex gap-4">
                        <div class="w-16 h-4 bg-surface-100 rounded animate-pulse"></div>
                        <div class="w-12 h-4 bg-surface-100 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[300px]"
        >
            <i class="pi pi-calendar text-5xl text-surface-300 mb-3"></i>
            <p class="text-lg font-medium text-surface-600">
                {{ t('views.server_activities.sessions_tab.empty_state') }}
            </p>
        </div>
    </InfiniteScrollContainer>
</template>

<style scoped>

</style>
