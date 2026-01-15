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
        <!-- Loading Overlay -->
        <div
            v-if="loading"
            class="absolute inset-0 rounded-2xl bg-surface-100/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
            <div class="flex flex-col items-center gap-3">
                <ProgressSpinner
                    style="width: 40px; height: 40px"
                    stroke-width="4"
                    animation-duration="1s"
                />
            </div>
        </div>

        <!-- Widget Content (always rendered) -->
        <div class="h-full w-full flex flex-col">
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
