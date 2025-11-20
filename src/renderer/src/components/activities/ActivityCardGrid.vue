<script setup lang="ts">
import { computed } from 'vue'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import ActivityCard from './ActivityCard.vue'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'
import { useI18n } from 'vue-i18n'

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
            <TransitionGroup
                name="activity-cards"
                tag="div"
                class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            >
                <ActivityCard
                    v-for="activity in activities"
                    :key="activity.public_id"
                    :activity="activity"
                    :metrics="metrics[activity.public_id]"
                    :loading="loading && !metrics[activity.public_id]"
                    @view="emit('view', activity.public_id)"
                />
                <template v-if="loading && !activities.length">
                    <ActivityCard
                        v-for="(_, index) in placeholderCards"
                        :key="`placeholder-${index}`"
                        :activity="{
                            public_id: `placeholder-${index}`,
                            name: 'Activity',
                            description: '',
                            banner: '',
                            logo: '',
                            server_public_id: ''
                        }"
                        :loading="true"
                    />
                </template>
            </TransitionGroup>

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

<style scoped>
.activity-cards-enter-active,
.activity-cards-leave-active {
    transition: all 0.25s ease;
}
.activity-cards-enter-from,
.activity-cards-leave-to {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
}
</style>
