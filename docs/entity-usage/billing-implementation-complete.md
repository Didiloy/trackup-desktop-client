# ✅ Billing Entity - Implementation Complete

## Summary

Successfully implemented the **billing** entity for Stripe subscription and billing portal management. Unlike other entities, this implementation **opens URLs in the default browser** instead of making API calls, as the backend handles redirects to Stripe.

## Key Difference: Browser-Based Flow

⚠️ **Important**: The billing endpoints work differently from other API endpoints:

- Backend constructs Stripe URLs and redirects (302)
- Access token is passed as a query parameter
- Electron opens the URL in the user's default browser
- User completes payment/management in browser
- Backend handles Stripe webhooks for subscription updates

## Files Created

### 1. Interfaces

**File**: `src/shared/contracts/interfaces/billing.interfaces.ts`

- `IBillingApiResponse` - Simple response wrapper (no data payload)

### 2. IPC Channels

**File**: `src/shared/contracts/ipc-channels/types/billing.channels.ts`

- `startSubscription`, `startPortal`

### 3. IPC Handlers

**File**: `src/main/ipc/billing.ipc.ts`

- Constructs URLs with access_token query parameter
- Validates URL scheme (security check)
- Uses `shell.openExternal()` to open browser
- Comprehensive error handling

### 4. Preload Bridge

**File**: `src/preload/bridges/billing.bridge.ts`

- Exposes 2 methods to renderer via `window.api.billing.*`

## Integration Complete

### Files Modified:

1. ✅ `src/shared/contracts/ipc-channels/index.channels.ts` - Added BILLING_CHANNELS
2. ✅ `src/main/ipc/index.ipc.ts` - Registered `registerBillingIpc()`
3. ✅ `src/preload/index.preload.ts` - Added `billingBridge` to API
4. ✅ `src/preload/index.preload.d.ts` - Added `BillingBridge` type

## API Endpoints (2/2)

| Endpoint                              | Handler                | Action                                 |
| ------------------------------------- | ---------------------- | -------------------------------------- |
| GET `/api/v1/billing/subscribe/start` | ✅ startSubscription() | Opens Stripe checkout in browser       |
| GET `/api/v1/billing/portal/start`    | ✅ startPortal()       | Opens Stripe billing portal in browser |

## Usage Examples

### Start Subscription Checkout

```typescript
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const accessToken = session.value?.access_token

const result = await window.api.billing.startSubscription(accessToken)

if (result.error) {
    console.error('Error:', result.error)
    // Possible errors:
    // - "Authentication required"
    // - "Invalid URL scheme"
    // - "Failed to open browser"
} else {
    // Success! Browser has opened with Stripe checkout
    console.log('Stripe checkout opened in browser')
}
```

### Start Billing Portal

```typescript
const result = await window.api.billing.startPortal(accessToken)

if (result.error) {
    console.error('Error:', result.error)
} else {
    // Success! Browser has opened with Stripe billing portal
    console.log('Billing portal opened in browser')
}
```

## Vue Component Example

```vue
<template>
    <div class="billing-actions">
        <h3>Manage Subscription</h3>

        <button @click="startSubscription" :disabled="loading" class="btn-primary">
            {{ loading ? 'Opening...' : 'Subscribe Now' }}
        </button>

        <button
            v-if="hasActiveSubscription"
            @click="openBillingPortal"
            :disabled="loading"
            class="btn-secondary"
        >
            {{ loading ? 'Opening...' : 'Manage Billing' }}
        </button>

        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const loading = ref(false)
const error = ref<string | null>(null)
const hasActiveSubscription = ref(false) // Check this from user state

async function startSubscription() {
    const accessToken = session.value?.access_token
    if (!accessToken) {
        error.value = 'Please log in first'
        return
    }

    loading.value = true
    error.value = null

    try {
        const result = await window.api.billing.startSubscription(accessToken)

        if (result.error) {
            error.value = result.error
        } else {
            // Browser opened successfully
            // Optionally show a message
            console.log('Redirected to Stripe checkout')
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
        loading.value = false
    }
}

async function openBillingPortal() {
    const accessToken = session.value?.access_token
    if (!accessToken) {
        error.value = 'Please log in first'
        return
    }

    loading.value = true
    error.value = null

    try {
        const result = await window.api.billing.startPortal(accessToken)

        if (result.error) {
            error.value = result.error
        } else {
            console.log('Redirected to Stripe billing portal')
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.billing-actions {
    padding: 20px;
}

.btn-primary,
.btn-secondary {
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    border: none;
    border-radius: 5px;
}

.btn-primary {
    background: #635bff;
    color: white;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error {
    color: red;
    margin-top: 10px;
    padding: 10px;
    background: #ffebee;
    border-radius: 4px;
}
</style>
```

## Vue Composable Example

```typescript
// src/renderer/src/composables/billing/useBilling.ts
import { ref } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

export function useBilling() {
    const { session } = useAuth()
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function startSubscription() {
        const accessToken = session.value?.access_token
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

    async function openBillingPortal() {
        const accessToken = session.value?.access_token
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
```

## Implementation Details

### URL Construction

The IPC handler constructs URLs with the access token as a query parameter:

```typescript
const url = `${API_BASE_URL}/api/v1/billing/subscribe/start?access_token=${encodeURIComponent(accessToken)}`
```

### Security Checks

1. **URL Scheme Validation**: Only http:// and https:// URLs are allowed
2. **Token Encoding**: Access token is properly URL-encoded
3. **Browser Isolation**: Opens in external browser, not in Electron window
4. **No Direct API Response**: Backend handles the redirect, Electron doesn't see Stripe URLs

### Environment Configuration

The base URL is configured via environment variable:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000'
```

Make sure to set `VITE_API_URL` in your `.env` file:

```
VITE_API_URL=https://your-api-domain.com
```

## Architecture Compliance

✅ No direct `ipcRenderer` usage in renderer
✅ Channels defined in shared contracts
✅ Uses `shell.openExternal` for browser opening
✅ Proper input validation in main process
✅ Type-safe throughout the chain
✅ Secure - URL scheme validation
✅ Follows all patterns from AI_README.md

## Flow Diagram

```
1. User clicks "Subscribe" in app
2. Renderer calls window.api.billing.startSubscription(token)
3. Main process constructs URL with token query param
4. Main process validates URL scheme
5. Main process calls shell.openExternal(url)
6. Default browser opens with backend URL
7. Backend redirects to Stripe checkout (302)
8. User completes payment in browser
9. Stripe sends webhook to backend
10. Backend updates user subscription status
```

## Common Errors

| Error                     | Meaning                        | Solution                         |
| ------------------------- | ------------------------------ | -------------------------------- |
| "Authentication required" | No access token provided       | Ensure user is logged in         |
| "Invalid URL scheme"      | URL doesn't start with http(s) | Check API_BASE_URL configuration |
| "Failed to open browser"  | shell.openExternal failed      | Check OS permissions             |

## Testing Checklist

- [ ] Start subscription opens browser
- [ ] Start billing portal opens browser
- [ ] Error handling for missing token
- [ ] Error handling for browser open failure
- [ ] URL is properly constructed
- [ ] Access token is URL-encoded
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Works on Linux

## Key Features

✅ **Browser-Based Flow** - Opens Stripe in default browser
✅ **Secure Token Passing** - Access token in query param, validated by backend
✅ **URL Validation** - Only http(s) schemes allowed
✅ **Error Handling** - Comprehensive error messages
✅ **Type-Safe** - Full TypeScript support
✅ **Environment Configurable** - Uses VITE_API_URL
✅ **No API Exposure** - Backend handles Stripe redirect

## Backend Requirements

The backend must:

1. Accept `access_token` as query parameter
2. Validate the token
3. Create Stripe session
4. Return 302 redirect to Stripe URL
5. Handle Stripe webhooks for subscription updates

## Status

🎉 **COMPLETE AND READY TO USE**

The billing entity is fully implemented and ready for use. It follows a different pattern than other entities because it opens URLs in a browser rather than making API calls.

You can now call `window.api.billing.*` methods from your Vue components!
