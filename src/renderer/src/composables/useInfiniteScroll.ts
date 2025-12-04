import { ref, Ref, watch } from 'vue'
import { useScroll, useDebounceFn } from '@vueuse/core'

interface UseInfiniteScrollOptions {
    /** Threshold in pixels before the end to trigger load more */
    threshold?: number
    /** Debounce delay in milliseconds */
    debounceMs?: number
    /** Loading state from parent (prevents triggering while already loading) */
    loading?: Ref<boolean>
    /** Whether there are more items to load */
    hasMore?: Ref<boolean>
}

interface UseInfiniteScrollReturn {
    /** Ref to attach to the scroll container */
    scrollRef: Ref<HTMLElement | null>
    /** Whether we're currently in debounce cooldown */
    isDebouncing: Ref<boolean>
}

export function useInfiniteScroll(
    onLoadMore: () => void | Promise<void>,
    options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
    const { threshold = 200, debounceMs = 300, loading, hasMore } = options

    const scrollRef = ref<HTMLElement | null>(null)
    const isDebouncing = ref(false)

    // Debounced load function
    const debouncedLoadMore = useDebounceFn(() => {
        isDebouncing.value = false
        onLoadMore()
    }, debounceMs)

    // Use VueUse's useScroll for reactive scroll state
    const { arrivedState } = useScroll(scrollRef, {
        offset: { bottom: threshold }
    })

    // Watch for when we arrive at the bottom
    watch(
        () => arrivedState.bottom,
        (isAtBottom) => {
            // Don't trigger if not at bottom
            if (!isAtBottom) return
            // Don't trigger if already loading
            if (loading?.value) return
            // Don't trigger if no more items
            if (hasMore && !hasMore.value) return
            // Don't trigger if already debouncing
            if (isDebouncing.value) return

            isDebouncing.value = true
            debouncedLoadMore()
        }
    )

    return {
        scrollRef,
        isDebouncing
    }
}
