<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        data?: number[]
        height?: number
    }>(),
    {
        data: () => [],
        height: 48
    }
)

const viewBoxHeight = computed(() => props.height)
const viewBoxWidth = computed(() => (props.data.length > 1 ? props.data.length - 1 : 1) * 10)

const polylinePoints = computed(() => {
    if (!props.data.length) return ''
    const max = Math.max(...props.data)
    const min = Math.min(...props.data)
    const range = max - min || 1
    return props.data
        .map((value, index) => {
            const x = (index / Math.max(props.data.length - 1, 1)) * viewBoxWidth.value
            const y = viewBoxHeight.value - ((value - min) / range) * viewBoxHeight.value
            return `${x},${y}`
        })
        .join(' ')
})
</script>

<template>
    <svg
        v-if="data.length"
        :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
        preserveAspectRatio="none"
        class="w-full h-16"
    >
        <defs>
            <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.45" />
                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.05" />
            </linearGradient>
        </defs>
        <polyline
            :points="polylinePoints"
            fill="transparent"
            stroke="url(#sparklineGradient)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
    <div
        v-else
        class="w-full h-16 rounded-md bg-surface-100 flex items-center justify-center text-xs text-surface-500"
    >
        —
    </div>
</template>
