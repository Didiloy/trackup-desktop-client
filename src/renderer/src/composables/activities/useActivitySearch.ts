import { ref, watch } from 'vue'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { ESearchMode } from '@shared/contracts/enums/search-mode.enum'

interface UseActivitySearchReturn {
    activityQuery: ReturnType<typeof ref<string>>
    activitySuggestions: ReturnType<typeof ref<IActivity[]>>
    selectedActivityId: ReturnType<typeof ref<string | undefined>>
    searchActivities: (query: string) => Promise<void>
    onActivityQueryChange: (value: string) => void
    clearActivitySearch: () => void
}

/**
 * Composable for activity search functionality
 * Searches first in the server store, then falls back to API
 */
export function useActivitySearch(): UseActivitySearchReturn {
    const { listActivities } = useActivityCRUD()
    const server_store = useServerStore()

    const activityQuery = ref<string>('')
    const activitySuggestions = ref<IActivity[]>([])
    const selectedActivityId = ref<string | undefined>(undefined)

    watch(activityQuery, (newVal) => {
        if (!newVal) {
            selectedActivityId.value = undefined
        }
    })

    /**
     * Search activities: first in store, then via API
     * @param query - Search query string
     */
    async function searchActivities(query: string): Promise<void> {
        if (!query || query.length < 2) {
            activitySuggestions.value = []
            return
        }

        // First, search in the store
        const storeActivities = server_store.getActivities || []
        const localMatches = storeActivities.filter((activity) =>
            activity.name.toLowerCase().includes(query.toLowerCase())
        )

        if (localMatches.length > 0) {
            activitySuggestions.value = localMatches
            return
        }

        // If not found in store, search via API
        if (!server_store.getPublicId) return

        const res = await listActivities(server_store.getPublicId, {
            search: query,
            searchMode: ESearchMode.CONTAINS,
            limit: 10
        })

        if (!res.error && res.data) {
            activitySuggestions.value = res.data.data || []
        }
    }

    /**
     * Handle activity query change
     * Tries to find the selected activity in suggestions
     * @param value - The new activity query value
     */
    function onActivityQueryChange(value: string): void {
        activityQuery.value = value

        // Try to find selected activity in suggestions
        const selected = activitySuggestions.value.find(
            (a) => a.name.toLowerCase() === value.toLowerCase()
        )
        selectedActivityId.value = selected?.public_id
    }

    /**
     * Clear all activity search state
     */
    function clearActivitySearch(): void {
        activityQuery.value = ''
        activitySuggestions.value = []
        selectedActivityId.value = undefined
    }

    return {
        activityQuery,
        activitySuggestions,
        selectedActivityId,
        searchActivities,
        onActivityQueryChange,
        clearActivitySearch
    }
}
