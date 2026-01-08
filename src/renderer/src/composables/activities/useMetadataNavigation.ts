import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

interface UseMetadataNavigationResult {
    navigateToMetadataProfile: (activityId: string, metadataDefinitionId: string) => Promise<void>
}

export function useMetadataNavigation(): UseMetadataNavigationResult {
    const router = useRouter()
    const server_store = useServerStore()

    async function navigateToMetadataProfile(
        activityId: string,
        metadataDefinitionId: string
    ): Promise<void> {
        await router.push({
            name: 'ServerActivityMetadataProfile',
            params: {
                id: server_store.getPublicId,
                activityId,
                metadataDefinitionId
            }
        })
    }

    return {
        navigateToMetadataProfile
    }
}
