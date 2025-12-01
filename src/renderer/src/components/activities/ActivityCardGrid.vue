<script setup lang="ts">
import { computed } from 'vue'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import ActivityCard from './ActivityCard.vue'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'
import { useI18n } from 'vue-i18n'
import TransitionGroupWrapper from '@/components/common/transitions/TransitionGroupWrapper.vue'

interface Props {
    activities: IActivity[]
    metrics: Record<string, ActivityCardMetrics | undefined>
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const emit = defineEmits<{
    (e: 'view', activityId: string): void
    (e: 'load-more'): void
}>()

const { t } = useI18n()

const isEmpty = computed(() => !props.loading && !props.activities.length)

function handleScroll(event: Event): void {
    const target = event.target as HTMLElement | null
    if (!target) return
    const { scrollTop, clientHeight, scrollHeight } = target
    const threshold = 200
    if (scrollTop + clientHeight + threshold >= scrollHeight) {
        emit('load-more')
    }
}
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <div class="flex-1 overflow-auto p-5" @scroll.passive="handleScroll">
            <!-- Activities Grid -->
            <TransitionGroupWrapper
                name="fade"
                tag="div"
                class="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
                <ActivityCard
                    v-for="activity in activities"
                    :key="activity.public_id"
                    :activity="activity"
                    :metrics="metrics[activity.public_id]"
                    :loading="loading && !metrics[activity.public_id]"
                    @view="emit('view', activity.public_id)"
                />
            </TransitionGroupWrapper>

            <!-- Loading State -->
            <div
                v-if="loading && activities.length === 0"
                class="relative z-10 grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 p-5 animate-pulse"
            >
                <div
                    v-for="n in 6"
                    :key="n"
                    class="group relative rounded-2xl bg-surface-100 border border-surface-100 shadow-sm overflow-hidden"
                >
                    <div class="relative z-10 flex flex-col gap-4 pb-4 h-full">
                        <!-- Banner Area -->
                        <div class="relative h-40 w-full bg-surface-200">
                            <div
                                class="absolute bottom-4 left-4 right-4 grid grid-cols-[auto_1fr_auto] items-center gap-3"
                            >
                                <div class="w-14 h-14 rounded-xl bg-surface-300"></div>
                                <div class="min-w-0 space-y-2">
                                    <div class="h-5 w-32 bg-surface-300 rounded"></div>
                                    <div class="h-3 w-24 bg-surface-300 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Metrics Grid -->
                        <div class="grid grid-cols-3 gap-3 px-4">
                            <div class="h-[72px] rounded-xl bg-surface-200"></div>
                            <div class="h-[72px] rounded-xl bg-surface-200"></div>
                            <div class="h-[72px] rounded-xl bg-surface-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else-if="isEmpty"
                class="flex flex-col items-center justify-center h-full min-h-[400px]"
            >
                <i class="pi pi-trophy text-7xl text-surface-300 mb-4"></i>
                <p class="text-xl font-medium text-surface-600">
                    {{ t('common.filters.no_results') }}
                </p>
                <p class="text-sm text-surface-500 mt-2">{{ t('common.filters.try_adjusting') }}</p>
            </div>
        </div>
    </div>
</template>
