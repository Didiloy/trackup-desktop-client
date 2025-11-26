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

const placeholderCards = computed(() => Array.from({ length: 6 }))

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
                class="relative z-10 flex flex-col gap-4 p-5 h-full animate-pulse"
            >
                <div
                    v-for="n in 6"
                    :key="n"
                    class="group relative rounded-2xl bg-surface-100 border border-surface-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-8 w-full">
                            <div class="w-12 h-12 rounded-xl bg-surface-200" />
                            <div class="flex-1 space-y-2">
                                <div class="h-4 bg-surface-200 rounded w-2/3"></div>
                                <div class="h-3 bg-surface-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-surface-200"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="h-16 bg-surface-200 rounded-xl"></div>
                        <div class="h-16 bg-surface-200 rounded-xl"></div>
                        <div class="h-16 bg-surface-200 rounded-xl"></div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-if="isEmpty"
                class="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-surface-200 text-surface-500"
            >
                <i class="pi pi-compass text-4xl mb-2 text-primary-500"></i>
                <p class="font-semibold text-surface-900">
                    {{ t('userInterface.serverActivitiesView.card.empty.title') }}
                </p>
                <p class="text-sm text-surface-500 max-w-md">
                    {{ t('userInterface.serverActivitiesView.card.empty.description') }}
                </p>
            </div>
        </div>
    </div>
</template>
