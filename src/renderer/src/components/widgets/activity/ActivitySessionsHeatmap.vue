<script setup lang="ts">
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'

const props = defineProps<{
    sessions: IActivitySessionListItem[]
}>()

const { t } = useI18n()

function normalizeDate(dateString: string): string {
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    return date.toISOString().slice(0, 10)
}

const heatmapData = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = 7 * 52 // ~1 year
    const start = new Date(today)
    start.setDate(start.getDate() - (days - 1))

    const stats = new Map<string, { count: number; duration: number }>()
    for (const session of props.sessions) {
        const key = normalizeDate(session.date)
        const durationMinutes = parseInt(session.duration)
        const current = stats.get(key) ?? { count: 0, duration: 0 }
        stats.set(key, {
            count: current.count + 1,
            duration: current.duration + durationMinutes
        })
    }

    const data: { date: Date; count: number; duration: number }[] = []
    const cursor = new Date(start)
    while (cursor <= today) {
        const key = cursor.toISOString().slice(0, 10)
        const entry = stats.get(key)
        data.push({
            date: new Date(cursor),
            count: entry?.count ?? 0,
            duration: entry?.duration ?? 0
        })
        cursor.setDate(cursor.getDate() + 1)
    }

    const weeks: { date: Date; count: number; duration: number }[][] = []
    for (let i = 0; i < data.length; i += 7) {
        weeks.push(data.slice(i, i + 7))
    }
    return weeks
})

function intensity(count: number): string {
    if (count === 0) return 'bg-primary-500/5'
    if (count === 1) return 'bg-primary-500/15'
    if (count === 2) return 'bg-primary-500/30'
    if (count <= 4) return 'bg-primary-500/50'
    if (count <= 6) return 'bg-primary-500/70'
    return 'bg-primary-500'
}

function tooltipFor(day: { date: Date; count: number; duration: number }): string {
    return `${day.date.toLocaleDateString()}: ${day.count} ${t('common.fields.items')} • ${formatMinutesToLabel(day.duration)}`
}
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200 p-5 w-full">
        <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-surface-600">
                {{ t('views.activity.performance_section.heatmap') }}
            </p>
            <p class="text-xs text-surface-500">
                {{ t('views.activity.performance_section.last_year') }}
            </p>
        </div>
        <div class="w-full overflow-x-auto">
            <div class="grid [grid-template-columns:repeat(52,minmax(0,1fr))] gap-1 min-w-full">
                <div v-for="(week, weekIndex) in heatmapData" :key="weekIndex" class="grid grid-rows-7 gap-1">
                    <div
                        v-for="day in week"
                        :key="day.date.toISOString()"
                        class="w-full aspect-square rounded-sm transition-colors duration-200"
                        v-tooltip.bottom="tooltipFor(day)"
                        :class="intensity(day.count)"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>
