import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

interface UseMemberNavigationResult {
    navigateToMemberProfile: (memberId: string) => Promise<void>
}

export function useMemberNavigation(): UseMemberNavigationResult {
    const router = useRouter()
    const server_store = useServerStore()

    async function navigateToMemberProfile(memberId: string): Promise<void> {
        await router.push({
            name: 'ServerMemberProfile',
            params: {
                id: server_store.getPublicId,
                memberId
            }
        })
    }

    return {
        navigateToMemberProfile
    }
}
