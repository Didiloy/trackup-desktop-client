<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'
import { convertMinuteToHoursMinute, formatNumber } from '@/utils'

interface Props {
    activity: IActivity
    metrics?: ActivityCardMetrics
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'view', activityId: string): void
}>()

const { t } = useI18n()

const durationText = computed(() => {
    if (!props.metrics) return '--'
    const minutes = props.metrics.totalDuration || 0
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`
    if (hours) return `${hours}h`
    return `${remainingMinutes}m`
})

const likesText = computed(() => formatNumber(props.metrics?.totalLikes))
const avgLikesText = computed(() => formatNumber(props.metrics?.avgLikesPerSession, 1))

function onCardClick(): void {
    emit('view', props.activity.public_id)
}
</script>

<template>
    <div
        class="group relative rounded-2xl bg-surface-100 border border-surface-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
        @click="onCardClick"
    >
        <div
            v-if="activity.banner"
            class="absolute inset-1/8 transition-opacity duration-500 rounded-2xl bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${activity.banner})` }"
        ></div>
        <div
            v-if="activity.banner"
            class="absolute inset-0 bg-surface-100/65 backdrop-blur-3xl rounded-2xl"
        ></div>

        <div class="relative z-10 flex flex-col gap-4 pb-4 h-full">
            <!-- Banner -->
            <div class="relative h-40 w-full overflow-hidden">
                <img
                    v-if="activity.banner"
                    :src="activity.banner"
                    :alt="activity.name"
                    class="w-full h-full object-cover transition-transform duration-300"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500/10 via-secondary-500/5 to-primary-500/5"
                ></div>

                <!-- Gradient overlay -->
                <div
                    class="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60"
                    v-if="activity.banner"
                ></div>

                <!-- Logo + Title -->
                <div
                    class="absolute bottom-4 left-4 right-4 grid grid-cols-[auto_1fr_auto] items-center gap-3"
                >
                    <div class="w-14 h-14">
                        <img
                            v-if="activity.logo"
                            :src="activity.logo"
                            class="w-14 h-14 rounded-xl object-cover shadow-lg ring-1 ring-black/20"
                        />
                        <div
                            v-else
                            class="w-14 h-14 rounded-xl bg-surface-200 flex items-center justify-center text-lg font-bold text-surface-700 shadow-lg ring-1 ring-black/20"
                        >
                            {{ activity.name.charAt(0).toUpperCase() }}
                        </div>
                    </div>
                    <div class="min-w-0">
                        <h3
                            class="text-lg font-semibold drop-shadow truncate"
                            :class="activity.banner ? 'text-white' : 'text-surface-900'"
                        >
                            {{ activity.name }}
                        </h3>
                        <p
                            class="text-xs line-clamp-1"
                            :class="activity.banner ? 'text-white/90' : 'text-surface-700'"
                        >
                            {{ activity.description }}
                        </p>
                    </div>
                    <div class="flex items-start gap-3 justify-end">
                        <div
                            v-tooltip.left="t('userInterface.serverActivitiesView.card.likes')"
                            class="flex items-center gap-1 text-red-500 font-semibold text-sm"
                        >
                            <i class="pi pi-heart-fill"></i>
                            <span>{{ likesText }}</span>
                        </div>
                        <div
                            v-tooltip.left="t('userInterface.serverActivitiesView.card.avg_likes')"
                            class="flex items-center gap-1 text-primary-500 font-semibold text-sm"
                        >
                            <i class="pi pi-chart-line"></i>
                            <span>{{ avgLikesText }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-sm px-4">
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.sessions')
                    }}</span>
                    <span class="text-lg font-semibold text-surface-900">
                        {{ metrics?.totalSessions ?? '—' }}
                    </span>
                </div>
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.duration')
                    }}</span>
                    <span class="text-lg font-semibold text-surface-900">
                        {{ durationText }}
                    </span>
                    <span class="text-xs text-surface-400 mt-1">{{
                        t('userInterface.serverActivitiesView.card.avg_duration', {
                            value: convertMinuteToHoursMinute(
                                Number(props.metrics?.avgSessionDuration ?? 0)
                            )
                        })
                    }}</span>
                </div>
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.unique_participants')
                    }}</span>
                    <span class="text-base font-semibold text-surface-900">
                        {{ metrics?.uniqueParticipants }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
