# ✅ Users Entity - Implementation Complete

## Summary

Successfully implemented the complete **users** entity for current user information and server list following the established architecture patterns from AI_README.md and the API service usage guide.

## Files Created

### 1. Interfaces

**File**: `src/shared/contracts/interfaces/user.interfaces.ts`

- `IUser` - User entity with id and email
- `IUserApiResponse<T>` - Generic API response wrapper
- `IUserServer` - Reuses `IServer` type (omits invite_code fields)

### 2. IPC Channels

**File**: `src/shared/contracts/ipc-channels/types/user.channels.ts`

- `getMe`, `getMyServers`

### 3. IPC Handlers

**File**: `src/main/ipc/user.ipc.ts`

- Uses `apiService` for all HTTP requests
- Includes authentication validation
- Proper error handling and logging

### 4. Preload Bridge

**File**: `src/preload/bridges/user.bridge.ts`

- Exposes 2 methods to renderer via `window.api.user.*`

## API Endpoints Implemented (2/2)

| Method | Endpoint                   | Handler           |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/v1/users/me`         | ✅ getMe()        |
| GET    | `/api/v1/users/me/servers` | ✅ getMyServers() |

## Integration Complete

### Files Modified:

1. ✅ `src/shared/contracts/ipc-channels/index.channels.ts` - Added USER_CHANNELS
2. ✅ `src/main/ipc/index.channels.ts` - Registered registerUserIpc()
3. ✅ `src/preload/index.channels.ts` - Added userBridge to API
4. ✅ `src/preload/index.preload.d.ts` - Added UserBridge type

## Data Model

### IUser

```typescript
{
    id: string // User ID (e.g., "6f1b6c5a-7f1a-4f5b-b8c8-3f7e1a2b9cde")
    email: string // User email (e.g., "user@example.com")
}
```

### IUserServer

```typescript
// Reuses IServer from servers.interfaces.ts
{
    public_id: string
    name: string
    server_type_public_id: string
    creator_id: string
    description: string | null
    logo: string | null
    // Note: invite_code and invite_code_expires_at are omitted
}
```

## Usage Examples

### Get Current User Information

```typescript
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const accessToken = session.value?.access_token

const result = await window.api.user.getMe(accessToken)

if (result.error) {
    console.error('Error:', result.error)
} else {
    console.log('Current user:', result.data)
    // {
    //   id: "6f1b6c5a-7f1a-4f5b-b8c8-3f7e1a2b9cde",
    //   email: "user@example.com"
    // }
}
```

### Get Current User's Servers

```typescript
const result = await window.api.user.getMyServers(accessToken)

if (result.error) {
    console.error('Error:', result.error)
} else {
    console.log('My servers:', result.data)
    // [
    //   {
    //     public_id: "srv_abc123def456",
    //     name: "My Gaming Server",
    //     server_type_public_id: "srvtype_550e8400-e29b-41d4-a716-446655440000",
    //     description: "A Minecraft servers for friends",
    //     logo: "https://example.com/logo.png"
    //   }
    // ]
}
```

## Vue Composable Example

```typescript
// src/renderer/src/composables/user/useCurrentUser.ts
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'
import type { IUser, IUserServer } from '@shared/contracts/interfaces/user.interfaces'

export function useCurrentUser() {
    const { session } = useAuth()
    const user = ref<IUser | null>(null)
    const servers = ref<IUserServer[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const accessToken = computed(() => session.value?.access_token || '')

    // Load current user info
    async function loadUserInfo() {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.user.getMe(accessToken.value)

            if (result.error) {
                error.value = result.error
            } else {
                user.value = result.data || null
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
        } finally {
            loading.value = false
        }
    }

    // Load user's servers
    async function loadUserServers() {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.user.getMyServers(accessToken.value)

            if (result.error) {
                error.value = result.error
            } else {
                servers.value = result.data || []
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        servers,
        loading,
        error,
        loadUserInfo,
        loadUserServers
    }
}
```

## Vue Component Example

```vue
<template>
    <div class="user-profile">
        <h2>My Profile</h2>

        <button @click="loadUserInfo" :disabled="loading">
            {{ loading ? 'Loading...' : 'Refresh Profile' }}
        </button>

        <div v-if="error" class="error">{{ error }}</div>

        <div v-if="user" class="user-info">
            <h3>User Information</h3>
            <p><strong>ID:</strong> {{ user.id }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
        </div>

        <div class="user-servers">
            <h3>My Servers</h3>
            <button @click="loadUserServers" :disabled="loading">
                {{ loading ? 'Loading...' : 'Refresh Servers' }}
            </button>

            <div v-if="servers.length === 0 && !loading" class="no-servers">
                You don't have any servers yet
            </div>

            <div v-for="server in servers" :key="server.public_id" class="server-card">
                <img v-if="server.logo" :src="server.logo" :alt="server.name" />
                <h4>{{ server.name }}</h4>
                <p v-if="server.description">{{ server.description }}</p>
                <small>{{ server.public_id }}</small>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCurrentUser } from '@/composables/user/useCurrentUser'

const { user, servers, loading, error, loadUserInfo, loadUserServers } = useCurrentUser()

onMounted(async () => {
    await loadUserInfo()
    await loadUserServers()
})
</script>

<style scoped>
.user-profile {
    padding: 20px;
}

.error {
    color: red;
    margin: 10px 0;
    padding: 10px;
    background: #ffebee;
    border-radius: 4px;
}

.user-info {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.user-servers {
    margin-top: 30px;
}

.no-servers {
    text-align: center;
    padding: 40px;
    color: #999;
}

.server-card {
    border: 1px solid #ccc;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
}

.server-card img {
    width: 50px;
    height: 50px;
    border-radius: 4px;
}

button {
    padding: 8px 16px;
    margin: 5px;
    cursor: pointer;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
```

## Key Features

✅ **Current User Info** - Get authenticated user's profile (id, email)
✅ **User's Servers** - List all servers the user is a member of
✅ **Type Reuse** - Reuses `IServer` interface for servers list
✅ **Minimal API** - Only 2 endpoints, focused on current user
✅ **Authentication Required** - Both endpoints require access token
✅ **Type-Safe** - Full TypeScript support throughout
✅ **Error Handling** - Comprehensive error responses

## Architecture Compliance

✅ No direct `ipcRenderer` usage in renderer
✅ Channels defined in shared contracts
✅ Uses `ApiService` for all HTTP requests
✅ Proper input validation in main process
✅ Type-safe throughout the chain
✅ Secure - no Node APIs exposed to renderer
✅ Follows all patterns from AI_README.md
✅ **Type Reuse** - Properly reuses `IServer` from server.interfaces.ts

## Common Use Cases

### 1. Display User Profile

```typescript
const { user, loadUserInfo } = useCurrentUser()
await loadUserInfo()

// Display in UI
<div>{{ user?.email }}</div>
```

### 2. Server Switcher

```typescript
const { servers, loadUserServers } = useCurrentUser()
await loadUserServers()

// Show dropdown of user's servers
<select v-model="selectedServer">
  <option v-for="servers in servers" :key="servers.public_id" :value="servers.public_id">
    {{ server.name }}
  </option>
</select>
```

### 3. Initialize App State

```typescript
onMounted(async () => {
    // Load user info and servers on app startup
    await Promise.all([
        window.api.user.getMe(accessToken),
        window.api.user.getMyServers(accessToken)
    ])
})
```

## Permissions

- **Get Me**: Authenticated user only (self)
- **Get My Servers**: Authenticated user only (self)

Both endpoints only return data for the authenticated user.

## Error Handling

All API calls return an object with either `data` or `error`:

```typescript
// Success
{ data: IUser } or { data: IUserServer[] }

// Error
{ error: "Error message" }
```

Common errors:

- `"Authentication required"` - Missing or invalid access token
- `"Unauthorized"` - Invalid token
- `"Forbidden"` - Insufficient permissions

## Status

🎉 **COMPLETE AND READY TO USE**

The users entity is fully implemented, integrated, and ready for use in the renderer. Both endpoints are mapped, validated, and type-safe.

You can now call `window.api.user.*` methods from your Vue components!

## Complete Implementation Checklist

- [x] Interfaces created with type reuse
- [x] IPC channels defined
- [x] IPC handlers using ApiService
- [x] Preload bridge created
- [x] Registered in main IPC index
- [x] Added to preload API aggregator
- [x] TypeScript types exported
- [x] No TypeScript errors
- [x] Follows architecture rules
- [x] Documentation created

**All entities are now complete!** 🎉
