<script setup lang="ts">
defineProps<{
    label: string
    description?: string
    value: string | number
    subValue?: string
    icon: string
    color: string
    bg: string
    loading?: boolean
}>()
</script>

<template>
    <div v-if="loading" class="h-32 rounded-2xl bg-surface-100 animate-pulse w-full"></div>
    <div
        v-else
        class="relative p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm hover:shadow-md transition-shadow w-full h-full text-left flex flex-col justify-between"
    >
        <slot name="corner" />
        <div class="flex items-start justify-between mb-4">
            <div :class="`p-3 rounded-xl ${bg} ${color}`">
                <i :class="icon" class="text-xl"></i>
            </div>
        </div>
        <div class="flex-1 flex flex-col">
            <p class="text-sm text-surface-500 font-medium mb-1 line-clamp-1">
                {{ label }}
            </p>
            <p
                v-if="description"
                class="text-xs text-surface-400 mb-2 line-clamp-2"
                v-tooltip.bottom="description"
            >
                {{ description }}
            </p>
            <h3 class="text-2xl font-bold text-surface-900 truncate">
                {{ value }}
            </h3>
            <p v-if="subValue" class="text-xs text-surface-400 mt-1 truncate">
                {{ subValue }}
            </p>
        </div>
    </div>
</template>
