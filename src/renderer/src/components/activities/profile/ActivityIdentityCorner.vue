<script setup lang="ts">
import { computed } from 'vue'
import { useActivityStatsStore } from '@/stores/activity-stats'
const activity_stats_store = useActivityStatsStore()

const props = withDefaults(
    defineProps<{
        show?: boolean
        class?: string
    }>(),
    {
        show: true,
        class: 'top-4 right-4'
    }
)

const activityName = computed(() => activity_stats_store.getDetails?.activity_name)
const isVisible = computed(() => props.show)
</script>

<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
    >
        <div v-if="isVisible && activityName" class="absolute z-10" :class="props.class">
            <div
                class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-100/80 backdrop-blur-sm border border-surface-200/50 text-[10px] font-medium text-surface-500 hover:text-primary-500 hover:border-primary-200 transition-colors pointer-events-none"
            >
                <i class="pi pi-tag text-[9px]"></i>
                <span class="max-w-[80px] truncate uppercase tracking-wider">{{
                    activityName
                }}</span>
            </div>
        </div>
    </Transition>
</template>
