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

// Helper to calculate control points for smooth bezier curves
const getControlPoint = (
    current: number[],
    previous: number[],
    next: number[],
    reverse: boolean = false
) => {
    const p = previous || current
    const n = next || current
    const smoothing = 0.2
    const o = line(p, n)
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [x, y]
}

const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

const points = computed(() => {
    if (!props.data.length) return []
    const max = Math.max(...props.data)
    const min = Math.min(...props.data)
    const range = max - min || 1

    return props.data.map((value, index) => {
        const x = (index / Math.max(props.data.length - 1, 1)) * viewBoxWidth.value
        const y = viewBoxHeight.value - ((value - min) / range) * viewBoxHeight.value
        return [x, y]
    })
})

const pathData = computed(() => {
    if (points.value.length === 0) return ''
    if (points.value.length === 1) return `M${points.value[0][0]},${points.value[0][1]}`

    const p = points.value
    let d = `M${p[0][0]},${p[0][1]}`

    for (let i = 0; i < p.length - 1; i++) {
        const cp1 = getControlPoint(p[i], p[i - 1], p[i + 1])
        const cp2 = getControlPoint(p[i + 1], p[i], p[i + 2], true)
        d += ` C${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${p[i + 1][0]},${p[i + 1][1]}`
    }
    return d
})

const fillPathData = computed(() => {
    if (!pathData.value) return ''
    return `${pathData.value} L${viewBoxWidth.value},${viewBoxHeight.value} L0,${viewBoxHeight.value} Z`
})
</script>

<template>
    <svg
        v-if="data.length"
        :viewBox="`0 -2 ${viewBoxWidth} ${viewBoxHeight}`"
        preserveAspectRatio="none"
        class="w-full h-18"
    >
        <defs>
            <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#4a84ff" />
                <stop offset="100%" stop-color="#d46eff" />
            </linearGradient>
            <linearGradient id="sparklineFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#4a84ff" stop-opacity="1" />
                <stop offset="100%" stop-color="#d46eff" stop-opacity="1" />
            </linearGradient>
        </defs>
        <!-- Fill area -->
        <path
            :d="fillPathData"
            fill="url(#sparklineFill)"
            stroke="none"
        />
        <!-- Line -->
        <path
            :d="pathData"
            fill="none"
            stroke="url(#sparklineGradient)"
            stroke-width="3"
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
