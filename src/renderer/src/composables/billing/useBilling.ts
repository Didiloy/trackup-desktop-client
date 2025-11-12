// src/renderer/src/composables/billing/useBilling.ts
import { ref, type Ref } from 'vue'
import { useUserStore } from '@/stores/user'

interface UseBillingReturn {
    loading: Ref<boolean>
    error: Ref<string | null>
    startSubscription: () => Promise<boolean>
    openBillingPortal: () => Promise<boolean>
}

export function useBilling(): UseBillingReturn {
    const user_store = useUserStore()
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function startSubscription(): Promise<boolean> {
        const accessToken = user_store.getAccessToken
        if (!accessToken) {
            error.value = 'Not authenticated'
            return false
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.billing.startSubscription(accessToken)

            if (result.error) {
                error.value = result.error
                return false
            }

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return false
        } finally {
            loading.value = false
        }
    }

    async function openBillingPortal(): Promise<boolean> {
        const accessToken = user_store.getAccessToken
        if (!accessToken) {
            error.value = 'Not authenticated'
            return false
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.billing.startPortal(accessToken)

            if (result.error) {
                error.value = result.error
                return false
            }

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        startSubscription,
        openBillingPortal
    }
}
