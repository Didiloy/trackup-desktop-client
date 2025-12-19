import { ref, computed, watch, Ref, UnwrapRef } from 'vue'

interface FetchOptions {
    page: number
    limit: number
    [key: string]: unknown
}

interface PaginatedResult<T> {
    data: T[]
    total: number
    error?: string
}

interface UsePaginatedFetcherParams<T> {
    /** Fonction qui retourne les données paginées */
    fetcher: (options: FetchOptions) => Promise<PaginatedResult<T>>

    /** Fonction appliquée uniquement aux NOUVEAUX items (ex: load stats) */
    onItemsAdded?: (items: T[]) => Promise<void>

    /** Limite par défaut */
    limit?: number

    /** Watchers qui doivent déclencher un reset */
    filters?: unknown[]
}

interface UsePaginatedFetcherReturn<T> {
    items: Ref<UnwrapRef<T>[]>
    total: Ref<number>
    page: Ref<number>
    loading: Ref<boolean>
    error: Ref<string | null>
    hasMore: Ref<boolean>
    load: () => Promise<void>
    reset: () => Promise<void>
    loadMore: () => Promise<void>
}

export function usePaginatedFetcher<T>(
    params: UsePaginatedFetcherParams<T>
): UsePaginatedFetcherReturn<T> {
    const { fetcher, onItemsAdded, filters = [], limit = 20 } = params

    const items = ref<UnwrapRef<T>[]>([]) as Ref<UnwrapRef<T>[]>
    const total = ref(0)
    const page = ref(1)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const options = computed<FetchOptions>(() => ({
        page: page.value,
        limit
    }))

    // Computed property to check if there are more items to load
    const hasMore = computed(() => items.value.length < total.value)

    async function load(): Promise<void> {
        loading.value = true
        error.value = null

        try {
            const result = await fetcher(options.value)

            if (result.error) {
                error.value = result.error
                return
            }

            const newItems = result.data
            total.value = result.total

            if (page.value === 1) {
                items.value = newItems as unknown as UnwrapRef<T>[]
            } else {
                // cast incoming items to UnwrapRef<T>[] to satisfy Vue typing
                items.value.push(...(newItems as unknown as UnwrapRef<T>[]))
            }

            // Appeler l'action "secondaire" (ex: charger les stats)
            if (onItemsAdded) {
                await onItemsAdded(newItems)
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Fetch failed'
        } finally {
            loading.value = false
        }
    }

    function reset(): Promise<void> {
        page.value = 1
        return load()
    }

    function loadMore(): Promise<void> {
        // Don't load more if already loading or no more items
        if (loading.value || !hasMore.value) {
            return Promise.resolve()
        }
        page.value++
        return load()
    }

    // Auto refresh when filters change
    if (filters.length) {
        watch(filters, reset)
    }

    return {
        items,
        total,
        page,
        loading,
        error,
        hasMore,
        load,
        reset,
        loadMore
    }
}
