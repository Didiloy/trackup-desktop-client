<script setup lang="ts">
import { toRef } from 'vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

interface Props {
    /** Whether data is currently being loaded */
    loading?: boolean
    /** Whether there are more items to load */
    hasMore?: boolean
    /** Threshold in pixels before the end to trigger load more */
    threshold?: number
    /** Debounce delay in milliseconds */
    debounceMs?: number
    /** Additional CSS classes for the container */
    containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    hasMore: true,
    threshold: 200,
    debounceMs: 300,
    containerClass: ''
})

const emit = defineEmits<{
    (e: 'load-more'): void
}>()

const loadingRef = toRef(props, 'loading')
const hasMoreRef = toRef(props, 'hasMore')

const { scrollRef } = useInfiniteScroll(() => emit('load-more'), {
    threshold: props.threshold,
    debounceMs: props.debounceMs,
    loading: loadingRef,
    hasMore: hasMoreRef
})
</script>

<template>
    <div ref="scrollRef" class="w-full h-full overflow-y-auto" :class="containerClass">
        <slot />
    </div>
</template>
