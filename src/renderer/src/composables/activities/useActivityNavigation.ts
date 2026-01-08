import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

interface UseActivityNavigationResult {
    navigateToActivityProfile: (activityId: string) => Promise<void>
}

export function useActivityNavigation(): UseActivityNavigationResult {
    const router = useRouter()
    const server_store = useServerStore()

    async function navigateToActivityProfile(activityId: string): Promise<void> {
        await router.push({
            name: 'ServerActivityProfile',
            params: {
                id: server_store.getPublicId,
                activityId
            }
        })
    }

    return {
        navigateToActivityProfile
    }
}
