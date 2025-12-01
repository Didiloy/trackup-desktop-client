<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'

const props = defineProps<{
    serverName: string
    period: Date[] | null
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:period', value: Date[] | null): void
    (e: 'refresh'): void
}>()

const { t } = useI18n()

const isLast7Days = computed(() => {
    if (!props.period || props.period.length !== 2) return false
    const [start, end] = props.period
    if (!start || !end) return false
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 7 || diffDays === 6 // Approximate
})

const isLast30Days = computed(() => {
    if (!props.period || props.period.length !== 2) return false
    const [start, end] = props.period
    if (!start || !end) return false
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 30 || diffDays === 29
})

function setLastDays(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    emit('update:period', [start, end])
}

</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                {{ props.serverName }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm">
                {{ t('views.server_stats.subtitle') }}
            </p>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 mr-2">
                <Button 
                    label="7d" 
                    size="small" 
                    :severity="isLast7Days ? 'primary' : 'secondary'" 
                    text 
                    @click="setLastDays(7)"
                />
                <Button 
                    label="30d" 
                    size="small" 
                    :severity="isLast30Days ? 'primary' : 'secondary'" 
                    text 
                    @click="setLastDays(30)"
                />
            </div>
            <div class="w-64">
                <DateRangeFilter
                    :model-value="props.period"
                    @update:model-value="emit('update:period', $event)"
                />
            </div>
            <Button
                icon="pi pi-refresh"
                :loading="props.loading"
                rounded
                text
                severity="secondary"
                @click="emit('refresh')"
            />
        </div>
    </div>
</template>

