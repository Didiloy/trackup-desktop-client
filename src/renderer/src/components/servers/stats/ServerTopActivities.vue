<script setup lang="ts">
import type { ITopActivity } from '@shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { useI18n } from 'vue-i18n'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { computed } from 'vue'

const props = defineProps<{
    activities: ITopActivity[] | undefined
    loading?: boolean
}>()

const { t } = useI18n()

const maxSessions = computed(() => {
    if (!props.activities?.length) return 1
    return Math.max(...props.activities.map(a => a.total_sessions))
})
</script>

<template>
    <div class="rounded-3xl bg-surface-0 dark:bg-surface-800 ring-1 ring-surface-200/60 dark:ring-surface-700 p-5 shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-surface-900 dark:text-surface-50">
                {{ t('views.server_stats.top_activities', 'Popular Activities') }}
            </h3>
        </div>

        <div v-if="loading" class="space-y-4">
             <div v-for="i in 5" :key="i" class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <Skeleton width="40%" />
                    <Skeleton width="20%" />
                </div>
                <Skeleton width="100%" height="0.5rem" />
            </div>
        </div>

        <div v-else-if="!activities?.length" class="text-center py-8 text-surface-400">
            {{ t('common.fields.none') }}
        </div>

        <div v-else class="space-y-5 max-h-[300px] overflow-y-auto pr-1">
            <div
                v-for="activity in activities"
                :key="activity.activity_id"
                class="group"
            >
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-sm font-medium text-surface-900 dark:text-surface-50 truncate pr-4">
                        {{ activity.activity_name }}
                    </span>
                    <span class="text-xs text-surface-500 flex items-center gap-2">
                        <span class="flex items-center gap-1">
                            <i class="pi pi-clock text-[10px]"></i>
                            {{ formatMinutesToLabel(activity.total_duration) }}
                        </span>
                        <span class="font-medium text-surface-700 dark:text-surface-300">
                             {{ activity.total_sessions }}
                        </span>
                    </span>
                </div>
                
                <div class="h-2 w-full bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div 
                        class="h-full bg-primary-500 rounded-full transition-all duration-500 group-hover:bg-primary-400"
                        :style="{ width: `${(activity.total_sessions / maxSessions) * 100}%` }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

