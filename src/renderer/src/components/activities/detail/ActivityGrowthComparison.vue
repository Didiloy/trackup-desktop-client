<script setup lang="ts">
import type { IActivityGrowthTrend } from '@shared/contracts/interfaces/entities-stats/activity-stats.interfaces'
import { computed } from 'vue'

const props = defineProps<{
    growth?: IActivityGrowthTrend | null
}>()

const statusText = computed(() => {
    const value = props.growth?.growth_percent ?? 0
    return value >= 0 ? 'En hausse' : 'En baisse'
})
</script>

<template>
    <div class="rounded-3xl bg-surface-100 ring-1 ring-surface-200/60 p-5 shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs uppercase text-surface-500 font-semibold">Évolution 30 jours</p>
                <p class="text-4xl font-bold text-surface-900">
                    {{ props.growth?.growth_percent?.toFixed(1) ?? '0' }}%
                </p>
                <p class="text-sm text-surface-500">
                    {{ statusText }}
                </p>
            </div>
            <div class="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-600">
                {{ props.growth?.trend || 'Trend' }}
            </div>
        </div>
    </div>
</template>
