import { useRouter } from 'vue-router'

interface UseHomeNavigationResult {
    navigateToHome: () => Promise<void>
}

export function useHomeNavigation(): UseHomeNavigationResult {
    const router = useRouter()

    async function navigateToHome(): Promise<void> {
        await router.push({ name: 'Home' })
    }

    return {
        navigateToHome
    }
}
