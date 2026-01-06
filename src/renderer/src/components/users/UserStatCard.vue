<script setup lang="ts">
import type { Component } from 'vue'
import Icon from '@/components/common/icons/Icon.vue'

defineProps<{
    label: string
    value: string | number
    icon: string | Component
    color: string
    bg: string
}>()
</script>

<template>
    <div
        class="p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm hover:shadow-md transition-shadow"
    >
        <div class="flex items-start justify-between mb-4">
            <div :class="`p-3 rounded-xl ${bg} ${color}`">
                <Icon :icon="icon" class="text-xl" />
            </div>
        </div>
        <p class="text-sm text-surface-500 font-medium mb-1">
            {{ label }}
        </p>
        <h3 class="text-2xl font-bold text-surface-900">
            {{ value }}
        </h3>
    </div>
</template>
