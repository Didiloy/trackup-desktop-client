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
        class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm base-widget-container h-full w-full flex flex-col"
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
.base-widget-container {
    border-radius: 1.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    border: 1px solid rgb(226 232 240 / 0.6);
}

.widget-body {
    min-height: 0; /* Important for flex children with overflow */
}
</style>
