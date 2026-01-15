<script setup lang="ts">
import { ref, watch } from 'vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const props = defineProps<{
    title?: string
    loading?: boolean
    noPadding?: boolean
    noHeader?: boolean
}>()

// Only show spinner after a brief delay (avoids flash for quick loads)
const showSpinner = ref(false)
let timeout: NodeJS.Timeout | null = null

watch(
    () => props.loading,
    (isLoading) => {
        if (isLoading) {
            // Show spinner after 150ms to avoid flash on quick loads
            timeout = setTimeout(() => {
                showSpinner.value = true
            }, 150)
        } else {
            if (timeout) clearTimeout(timeout)
            showSpinner.value = false
        }
    },
    { immediate: true }
)
</script>

<template>
    <div
        class="relative p-5 rounded-2xl bg-surface-0 ring-1 ring-surface-200/60 shadow-sm h-full w-full flex flex-col hover:shadow-md transition-shadow text-left justify-between"
    >
        <!-- Loading Overlay with smooth transition -->
        <TransitionWrapper>
            <div
                v-if="loading && showSpinner"
                class="absolute inset-0 rounded-2xl bg-surface-50/90 backdrop-blur-sm flex items-center justify-center z-10"
            >
                <!-- Lightweight CSS spinner -->
                <div class="spinner"></div>
            </div>
        </TransitionWrapper>

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

/* Lightweight CSS spinner (much faster than ProgressSpinner component) */
.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(var(--primary-500), 0.1);
    border-top-color: rgb(var(--primary-500));
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
