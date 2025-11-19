<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import type { ActivityCardMetrics } from '@/components/activities/types/activity-card.types'
import ActivitySparkline from './ActivitySparkline.vue'
import Menu from 'primevue/menu'

interface Props {
    activity: IActivity
    metrics?: ActivityCardMetrics
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const emit = defineEmits<{
    (e: 'view', activityId: string): void
    (e: 'edit', activityId: string): void
    (e: 'delete', activityId: string): void
}>()

const { t } = useI18n()
const actionMenu = ref<InstanceType<typeof Menu> | null>(null)

function formatNumber(value?: number | null, fractionDigits = 0): string {
    if (value === undefined || value === null || Number.isNaN(value)) return '—'
    return value.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    })
}

const durationText = computed(() => {
    if (!props.metrics) return '--'
    const minutes = props.metrics.totalDuration || 0
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`
    if (hours) return `${hours}h`
    return `${remainingMinutes}m`
})

const avgSessionDurationText = computed(() =>
    props.metrics?.avgSessionDuration
        ? `${Math.max(1, Math.round((props.metrics.avgSessionDuration ?? 0) / 60))}m`
        : '—'
)

const growthBadge = computed(() => {
    if (!props.metrics) return { text: '--', positive: true }
    const value = props.metrics.growthPercent || 0
    const sign = value > 0 ? '+' : ''
    return {
        text: `${sign}${value.toFixed(1)}%`,
        positive: value >= 0
    }
})

const topContributor = computed(() => {
    return props.metrics?.topContributor || t('common.none')
})

const likesText = computed(() => formatNumber(props.metrics?.totalLikes))
const avgLikesText = computed(() => formatNumber(props.metrics?.avgLikesPerSession, 1))
const uniqueParticipantsText = computed(() => formatNumber(props.metrics?.uniqueParticipants))
const totalParticipantsText = computed(() => formatNumber(props.metrics?.totalParticipants))
const avgParticipantsText = computed(() =>
    formatNumber(props.metrics?.avgParticipantsPerSession, 1)
)
const popularityText = computed(() => formatNumber(props.metrics?.popularityScore, 0))

const sparklineData = computed(() => props.metrics?.sparkline ?? [])

const menuItems = computed(() => [
    {
        label: t('userInterface.serverActivitiesView.card.actions.details'),
        icon: 'pi pi-eye',
        command: () => emit('view', props.activity.public_id)
    },
    {
        label: t('userInterface.serverActivitiesView.card.actions.edit'),
        icon: 'pi pi-pencil',
        command: () => emit('edit', props.activity.public_id)
    },
    {
        label: t('userInterface.serverActivitiesView.card.actions.delete'),
        icon: 'pi pi-trash',
        command: () => emit('delete', props.activity.public_id)
    }
])

function onCardClick(): void {
    if (props.loading) return
    emit('view', props.activity.public_id)
}

function toggleActions(event: MouseEvent): void {
    event.stopPropagation()
    actionMenu.value?.toggle(event)
}
</script>

<template>
    <div
        class="group relative rounded-2xl bg-surface-100 border border-surface-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
        @click="onCardClick"
    >
        <div
            v-if="activity.banner"
            class="absolute inset-0 transition-opacity duration-500 rounded-2xl bg-cover bg-center"
            :style="{ backgroundImage: `url(${activity.banner})` }"
        ></div>
        <div
            v-if="activity.banner"
            class="absolute inset-0 bg-surface-100/60 backdrop-blur-3xl rounded-2xl"
        ></div>

        <div v-if="loading" class="relative z-10 flex flex-col gap-4 p-5 h-full animate-pulse">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 w-full">
                    <div class="w-12 h-12 rounded-xl bg-surface-200" />
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-surface-200 rounded w-2/3"></div>
                        <div class="h-3 bg-surface-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="w-8 h-8 rounded-full bg-surface-200"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="h-16 bg-surface-200 rounded-xl"></div>
                <div class="h-16 bg-surface-200 rounded-xl"></div>
            </div>
            <div class="h-3 bg-surface-200 rounded w-2/3"></div>
            <div class="h-3 bg-surface-200 rounded w-1/3"></div>
            <div class="h-16 bg-surface-200 rounded-lg"></div>
        </div>
        <div v-else class="relative z-10 flex flex-col gap-4 p-5 h-full">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-semibold text-primary-700 shadow-inner overflow-hidden"
                    >
                        <img
                            v-if="activity.logo"
                            :src="activity.logo"
                            :alt="activity.name"
                            class="w-full h-full object-cover"
                        />
                        <span v-else>{{ activity.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-surface-900">
                            {{ activity.name }}
                        </h3>
                        <p class="text-xs text-surface-500 line-clamp-1">
                            {{ activity.description }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div
                        v-if="!loading"
                        v-tooltip.left="t('userInterface.serverActivitiesView.card.likes')"
                        class="flex items-center gap-1 text-red-500 font-semibold text-sm"
                    >
                        <i class="pi pi-heart-fill"></i>
                        <span>{{ likesText }}</span>
                    </div>
                    <div
                        v-if="!loading"
                        v-tooltip.left="t('userInterface.serverActivitiesView.card.avg_likes')"
                        class="flex items-center gap-1 text-primary-500 font-semibold text-sm"
                    >
                        <i class="pi pi-chart-line"></i>
                        <span>{{ avgLikesText }}</span>
                    </div>
                    <Button
                        icon="pi pi-ellipsis-h"
                        text
                        rounded
                        severity="secondary"
                        @click.stop="toggleActions"
                    />
                    <Menu ref="actionMenu" :model="menuItems" popup />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
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
                            value: avgSessionDurationText
                        })
                    }}</span>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-xs">
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.unique_participants')
                    }}</span>
                    <span class="text-base font-semibold text-surface-900">
                        {{ uniqueParticipantsText }}
                    </span>
                </div>
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.avg_participants')
                    }}</span>
                    <span class="text-base font-semibold text-surface-900">
                        {{ avgParticipantsText }}
                    </span>
                </div>
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.popularity')
                    }}</span>
                    <span class="text-base font-semibold text-surface-900">
                        {{ popularityText }}
                    </span>
                    <div class="h-1.5 bg-surface-200 rounded-full overflow-hidden mt-2">
                        <div
                            class="h-full bg-primary-500 rounded-full transition-all duration-300"
                            :style="{
                                width: `${Math.min(props.metrics?.popularityScore ?? 0, 100)}%`
                            }"
                        ></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.top_contributor')
                    }}</span>
                    <span class="text-surface-900 font-medium truncate max-w-full">
                        {{ topContributor }}
                    </span>
                </div>
                <div
                    class="flex flex-col rounded-xl bg-surface-200 p-3 shadow-inner border border-surface-100"
                >
                    <span class="text-xs text-surface-500">{{
                        t('userInterface.serverActivitiesView.card.total_participants')
                    }}</span>
                    <span class="text-base font-semibold text-surface-900">
                        {{ totalParticipantsText }}
                    </span>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-xs text-surface-500">{{
                    t('userInterface.serverActivitiesView.card.growth')
                }}</span>
                <span
                    class="text-sm font-semibold"
                    :class="growthBadge.positive ? 'text-emerald-600' : 'text-red-500'"
                >
                    {{ growthBadge.text }}
                </span>
            </div>

            <ActivitySparkline :data="sparklineData" />
        </div>
    </div>
</template>

<style scoped></style>
