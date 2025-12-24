import { ref, watch } from 'vue'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useServerStore } from '@/stores/server'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

interface UseMemberSearchReturn {
    memberQuery: ReturnType<typeof ref<string>>
    memberSuggestions: ReturnType<typeof ref<IServerMember[]>>
    selectedMemberId: ReturnType<typeof ref<string | undefined>>
    searchMembers: (query: string) => Promise<void>
    onMemberQueryChange: (value: string) => void
    clearMemberSearch: () => void
}

/**
 * Composable for member search functionality
 * Searches first in the server store, then falls back to API
 */
export function useMemberSearch(): UseMemberSearchReturn {
    const { listMembers } = useMemberCRUD()
    const server_store = useServerStore()

    const memberQuery = ref<string>('')
    const memberSuggestions = ref<IServerMember[]>([])
    const selectedMemberId = ref<string | undefined>(undefined)

    watch(memberQuery, (newVal) => {
        if (!newVal) {
            selectedMemberId.value = undefined
        }
    })

    /**
     * Search members: first in store, then via API
     * @param query - Search query string
     */
    async function searchMembers(query: string): Promise<void> {
        if (!query || query.length < 2) {
            memberSuggestions.value = []
            return
        }

        // First, search in the store
        const storeMembers = server_store.getMembers || []
        const localMatches = storeMembers.filter((member) => {
            const nickname = member.nickname?.toLowerCase() || ''
            const searchQuery = query.toLowerCase()
            return nickname.includes(searchQuery)
        })

        if (localMatches.length > 0) {
            memberSuggestions.value = localMatches
            return
        }

        // If not found in store, search via API
        if (!server_store.getPublicId) return

        const res = await listMembers(server_store.getPublicId, {
            search: query,
            limit: 10
        })

        if (!res.error && res.data) {
            memberSuggestions.value = res.data.data || []
        }
    }

    /**
     * Handle member query change
     * Tries to find the selected member in suggestions
     * @param value - The new member query value
     */
    function onMemberQueryChange(value: string): void {
        memberQuery.value = value

        // Try to find selected member in suggestions
        const selected = memberSuggestions.value.find(
            (m) => m.nickname?.toLowerCase() === value.toLowerCase()
        )
        selectedMemberId.value = selected?.public_id
    }

    /**
     * Clear all member search state
     */
    function clearMemberSearch(): void {
        memberQuery.value = ''
        memberSuggestions.value = []
        selectedMemberId.value = undefined
    }

    return {
        memberQuery,
        memberSuggestions,
        selectedMemberId,
        searchMembers,
        onMemberQueryChange,
        clearMemberSearch
    }
}
