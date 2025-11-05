# API Service Usage Guide

## Overview

The `ApiService` is a generic, reusable service for making authenticated HTTP requests to the backend API. It handles:

- Authentication headers
- Error handling
- Request/response transformation
- Logging
- Query parameter building

## Location

- Service: `src/main/services/ApiService.ts`
- Singleton instance: `apiService`

## Available Methods

```typescript
// GET request
apiService.get<T>(endpoint, accessToken, options?)

// POST request
apiService.post<T>(endpoint, accessToken, body?, options?)

// PUT request
apiService.put<T>(endpoint, accessToken, body?, options?)

// PATCH request
apiService.patch<T>(endpoint, accessToken, body?, options?)

// DELETE request
apiService.delete<T>(endpoint, accessToken, options?)
```

## Example: Server IPC Handlers

See `src/main/ipc/server.ipc.ts` for a complete example:

```typescript
import { apiService } from '../services/ApiService'

// Create a servers
return apiService.post<IServer>('/api/v1/servers/create', accessToken, request)

// Get servers details
return apiService.get<IServer>(`/api/v1/servers/${serverId}`, accessToken)

// Update servers
return apiService.put<IServer>(`/api/v1/servers/${serverId}`, accessToken, request)

// Delete servers
return apiService.delete<void>(`/api/v1/servers/${serverId}`, accessToken)
```

## Creating IPC Handlers for New Entities

### Step 1: Define Interfaces

Create `src/shared/contracts/interfaces/<entity>.interfaces.ts`:

```typescript
export interface IChannel {
  public_id: string
  name: string
  server_id: string
  // ... other fields
}

export interface ICreateChannelRequest {
  name: string
  server_id: string
  // ... other fields
}

export interface IUpdateChannelRequest {
  name?: string
  // ... other optional fields
}

export interface IChannelApiResponse<T = unknown> {
  data?: T
  error?: string
}
```

### Step 2: Define IPC Channels

Create `src/shared/contracts/ipc-channels/types/<entity>.ts`:

```typescript
export const CHANNEL_CHANNELS = {
  create: 'channel:create',
  getById: 'channel:getById',
  list: 'channel:list',
  update: 'channel:update',
  delete: 'channel:delete'
} as const
```

Update `src/shared/contracts/ipc-channels/index.channels.ts`:

```typescript
import { CHANNEL_CHANNELS } from './types/channel'

export const ipc_channels = {
  // ...existing channels
  channel: CHANNEL_CHANNELS
} as const
```

### Step 3: Create IPC Handlers

Create `src/main/ipc/<entity>.ipc.ts`:

```typescript
import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IChannel,
  ICreateChannelRequest,
  IUpdateChannelRequest,
  IChannelApiResponse
} from '../../shared/contracts/interfaces/channel.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

const logger = new Logger('IPC:Channel')

export function registerChannelIpc(): void {
  // Create channel
  ipcMain.handle(
    ipc_channels.channel.create,
    async (
      _event,
      request: ICreateChannelRequest,
      accessToken: string
    ): Promise<IChannelApiResponse<IChannel>> => {
      logger.info('Creating channel:', request.name)

      // Validate input
      if (!request.name || !request.server_id) {
        return { error: 'Name and server_id are required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IChannel>('/api/v1/channels/create', accessToken, request)
    }
  )

  // Get channel by ID
  ipcMain.handle(
    ipc_channels.channel.getById,
    async (
      _event,
      channelId: string,
      accessToken: string
    ): Promise<IChannelApiResponse<IChannel>> => {
      logger.info('Getting channel:', channelId)

      if (!channelId) {
        return { error: 'Channel ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IChannel>(`/api/v1/channels/${channelId}`, accessToken)
    }
  )

  // List channels (with query params example)
  ipcMain.handle(
    ipc_channels.channel.list,
    async (
      _event,
      serverId: string,
      accessToken: string
    ): Promise<IChannelApiResponse<IChannel[]>> => {
      logger.info('Listing channels for servers:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IChannel[]>('/api/v1/channels', accessToken, {
        params: { server_id: serverId }
      })
    }
  )

  // Update channel
  ipcMain.handle(
    ipc_channels.channel.update,
    async (
      _event,
      channelId: string,
      request: IUpdateChannelRequest,
      accessToken: string
    ): Promise<IChannelApiResponse<IChannel>> => {
      logger.info('Updating channel:', channelId)

      if (!channelId) {
        return { error: 'Channel ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.put<IChannel>(`/api/v1/channels/${channelId}`, accessToken, request)
    }
  )

  // Delete channel
  ipcMain.handle(
    ipc_channels.channel.delete,
    async (_event, channelId: string, accessToken: string): Promise<IChannelApiResponse<void>> => {
      logger.info('Deleting channel:', channelId)

      if (!channelId) {
        return { error: 'Channel ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(`/api/v1/channels/${channelId}`, accessToken)
    }
  )

  logger.info('Channel IPC handlers registered')
}
```

### Step 4: Register IPC Handlers

Update `src/main/ipc/index.channels.ts`:

```typescript
import { registerChannelIpc } from './channel.ipc'

export function registerAllIpc(): void {
  // ...existing registrations
  registerChannelIpc()
}
```

### Step 5: Create Preload Bridge

Create `src/preload/bridges/<entity>.bridge.ts`:

```typescript
import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IChannel,
  ICreateChannelRequest,
  IUpdateChannelRequest,
  IChannelApiResponse
} from '../../shared/contracts/interfaces/channel.interfaces'

export const channelBridge = {
  create: (
    request: ICreateChannelRequest,
    accessToken: string
  ): Promise<IChannelApiResponse<IChannel>> => {
    return ipcRenderer.invoke(ipc_channels.channel.create, request, accessToken)
  },

  getById: (channelId: string, accessToken: string): Promise<IChannelApiResponse<IChannel>> => {
    return ipcRenderer.invoke(ipc_channels.channel.getById, channelId, accessToken)
  },

  list: (serverId: string, accessToken: string): Promise<IChannelApiResponse<IChannel[]>> => {
    return ipcRenderer.invoke(ipc_channels.channel.list, serverId, accessToken)
  },

  update: (
    channelId: string,
    request: IUpdateChannelRequest,
    accessToken: string
  ): Promise<IChannelApiResponse<IChannel>> => {
    return ipcRenderer.invoke(ipc_channels.channel.update, channelId, request, accessToken)
  },

  delete: (channelId: string, accessToken: string): Promise<IChannelApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.channel.delete, channelId, accessToken)
  }
}

export type ChannelBridge = typeof channelBridge
```

### Step 6: Expose Bridge in Preload

Update `src/preload/index.channels.ts`:

```typescript
import { channelBridge } from './bridges/channel.bridge'

const api = {
  // ...existing bridges
  channel: channelBridge
}
```

Update `src/preload/index.preload.d.ts`:

```typescript
import type { ChannelBridge } from './bridges/channel.bridge'

export interface API {
  // ...existing bridges
  channel: ChannelBridge
}
```

### Step 7: Use in Renderer

In your Vue component or composable:

```typescript
// Get access token from auth state
const { session } = useAuth()
const accessToken = session.value?.access_token

// Create a channel
const result = await window.api.channel.create(
  {
    name: 'General',
    server_id: 'srv_123'
  },
  accessToken
)

if (result.error) {
  console.error('Error:', result.error)
} else {
  console.log('Channel created:', result.data)
}

// List channels
const channels = await window.api.channel.list('srv_123', accessToken)

// Update channel
await window.api.channel.update('chn_456', { name: 'New Name' }, accessToken)

// Delete channel
await window.api.channel.delete('chn_456', accessToken)
```

## Benefits

1. **DRY**: No duplicate fetch/error handling code
2. **Type-safe**: Full TypeScript support with generics
3. **Consistent**: Same pattern for all entities
4. **Maintainable**: Changes to auth/error handling in one place
5. **Testable**: Easy to mock the API service
6. **Extensible**: Add new HTTP methods easily

## Advanced Usage

### Query Parameters

```typescript
// GET with query params
apiService.get<IChannel[]>('/api/v1/channels', accessToken, {
  params: {
    server_id: 'srv_123',
    limit: 20,
    offset: 0
  }
})
// Result: GET /api/v1/channels?server_id=srv_123&limit=20&offset=0
```

### Custom Headers

```typescript
apiService.post<IChannel>('/api/v1/channels', accessToken, body, {
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

### Different Base URL

```typescript
// Create a new instance for a different API
const anotherApi = new ApiService('https://api.example.com')
anotherApi.get('/endpoint', accessToken)
```
