import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

interface UseSessionNavigationResult {
    navigateToSessionProfile: (sessionId: string) => Promise<void>
}

export function useSessionNavigation(): UseSessionNavigationResult {
    const router = useRouter()
    const server_store = useServerStore()

    async function navigateToSessionProfile(sessionId: string): Promise<void> {
        await router.push({
            name: 'ServerSessionProfile',
            params: {
                id: server_store.getPublicId,
                sessionId
            }
        })
    }

    return {
        navigateToSessionProfile
    }
}
