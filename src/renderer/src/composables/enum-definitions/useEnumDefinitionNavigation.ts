import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

interface UseEnumDefinitionNavigationResult {
    navigateToEnumDefinitionProfile: (
        enumDefinitionId: string,
        colorIndex?: number
    ) => Promise<void>
}

export function useEnumDefinitionNavigation(): UseEnumDefinitionNavigationResult {
    const router = useRouter()
    const server_store = useServerStore()

    async function navigateToEnumDefinitionProfile(
        enumDefinitionId: string,
        colorIndex?: number
    ): Promise<void> {
        await router.push({
            name: 'ServerEnumDefinitionProfile',
            params: {
                id: server_store.getPublicId,
                enumDefinitionId
            },
            ...(colorIndex !== undefined && { query: { colorIndex: colorIndex.toString() } })
        })
    }

    return {
        navigateToEnumDefinitionProfile
    }
}
