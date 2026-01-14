import { useRouter } from 'vue-router'

interface UseHomeNavigationResult {
    navigateToHome: () => Promise<void>
    navigateToLoginOrSignUp: () => Promise<void>
    navigateToAcceptTerms: () => Promise<void>
}

export function useAppNavigation(): UseHomeNavigationResult {
    const router = useRouter()

    async function navigateToHome(): Promise<void> {
        await router.push({ name: 'Home' })
    }

    async function navigateToLoginOrSignUp(): Promise<void> {
        await router.push({ name: 'Login' })
    }

    async function navigateToAcceptTerms(): Promise<void> {
        await router.push({ name: 'AcceptTerms' })
    }

    return {
        navigateToHome,
        navigateToLoginOrSignUp,
        navigateToAcceptTerms
    }
}
