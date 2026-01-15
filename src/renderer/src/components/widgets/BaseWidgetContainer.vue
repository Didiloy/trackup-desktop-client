<script setup lang="ts">
defineProps<{
    title?: string
    loading?: boolean
    noPadding?: boolean
    noHeader?: boolean
}>()
</script>

<template>
    <div
        class="relative p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm h-full w-full flex flex-col hover:shadow-md transition-shadow text-left justify-between"
    >
        <!-- Loading State -->
        <div v-if="loading" class="h-full w-full rounded-2xl bg-surface-100 animate-pulse"></div>

        <!-- Widget Content -->
        <div v-else class="h-full w-full flex flex-col">
            <!-- Header Section (Optional) -->
            <div v-if="!noHeader && (title || $slots.header)" class="widget-header shrink-0">
                <slot name="header">
                    <div v-if="title" class="px-5 pt-5 pb-3">
                        <h3 class="text-lg font-bold text-surface-900">
                            {{ title }}
                        </h3>
                    </div>
                </slot>
            </div>

            <!-- Main Content -->
            <div
                class="widget-body flex-1 flex flex-col overflow-hidden"
                :class="noPadding ? '' : 'p-1'"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
.widget-body {
    min-height: 0; /* Important for flex children with overflow */
}
</style>
