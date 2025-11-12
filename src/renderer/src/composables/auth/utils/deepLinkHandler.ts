import { error, setError } from './authState'
import { handlePKCEFlow, handleImplicitFlow } from './authFlowHandlers'

/**
 * Parse and extract error from URL (query params or hash fragment)
 */
function extractErrorFromUrl(parsed: URL): string | null {
    return (
        parsed.searchParams.get('error_description') ||
        parsed.searchParams.get('error') ||
        new URLSearchParams(parsed.hash.slice(1)).get('error_description') ||
        new URLSearchParams(parsed.hash.slice(1)).get('error')
    )
}

/**
 * Handle authentication callback from deep link URL
 * Supports both PKCE and implicit OAuth flows
 */
export async function handleDeepLinkUrl(url: string): Promise<void> {
    try {
        const parsed = new URL(url)

        // Check for errors in the callback
        const errorDescription = extractErrorFromUrl(parsed)
        if (errorDescription) {
            error.value = errorDescription
            return
        }

        // Handle PKCE flow (code in query params)
        const code = parsed.searchParams.get('code')
        if (code) {
            await handlePKCEFlow(code)
            return
        }

        // Handle implicit flow (tokens in hash fragment)
        const hashParams = new URLSearchParams(parsed.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
            await handleImplicitFlow(accessToken, refreshToken || '')
        }
    } catch (e) {
        setError(e, 'Authentication failed')
    }
}

/**
 * Setup listener for deep link callbacks from the main process
 */
export function setupDeepLinkListener(): (() => void) | null {
    if (typeof window === 'undefined') return null

    // Subscribe via typed preload bridge
    const unsubscribe = window.api.auth.onCallbackUrl((url) => {
        void handleDeepLinkUrl(url)
    })

    return unsubscribe
}
