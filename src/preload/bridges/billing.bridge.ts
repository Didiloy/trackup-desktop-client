import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels/index.channels'
import type { IBillingApiResponse } from '../../shared/contracts/interfaces/billing.interfaces'

/**
 * Billing API Bridge
 * Exposes billing-related functions to the renderer
 * These open URLs in the default browser instead of making API calls
 */
export const billingBridge = {
    /**
     * Start subscription checkout
     * Opens the subscription checkout URL in the default browser
     */
    startSubscription: (accessToken: string): Promise<IBillingApiResponse> => {
        return ipcRenderer.invoke(ipc_channels.billing.startSubscription, accessToken)
    },

    /**
     * Start billing portal
     * Opens the billing portal URL in the default browser
     */
    startPortal: (accessToken: string): Promise<IBillingApiResponse> => {
        return ipcRenderer.invoke(ipc_channels.billing.startPortal, accessToken)
    }
}

export type BillingBridge = typeof billingBridge
