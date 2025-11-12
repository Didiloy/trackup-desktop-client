# Sessions API - Complete Usage Guide

## Overview

The sessions API allows you to manage activity sessions within a server. Sessions track user participation in activities, including duration, participants, enum values, and social features like likes. This is the most complex entity with pagination, nested data, and social interactions.

## Available Operations

### 1. Create Session

```typescript
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const accessToken = session.value?.access_token

const result = await window.api.session.create(
    'srv_123', // servers ID
    {
        activity_id: 'activity_123e4567-e89b-12d3-a456-426614174000',
        duration: 30, // Duration in minutes
        date: '2025-09-24T15:00:00.000Z', // ISO 8601 date
        participants: [
            'member_123e4567-e89b-12d3-a456-426614174000',
            'member_987e6543-e21b-32d3-b654-126614174999'
        ],
        enums: [
            {
                enum_value_id: 'enumval_123e4567-e89b-12d3-a456-426614174000',
                selected_key: 'value3'
            }
        ]
    },
    accessToken
)

if (result.error) {
    console.error('Error creating session:', result.error)
} else {
    console.log('Session created:', result.data)
    // result.data structure:
    // {
    //   public_id: "activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce",
    //   date: "2025-09-25T09:01:18.877Z",
    //   duration: "60",
    //   activity: {
    //     public_id: "activity_966c1c61-b5a2-4f50-ac6d-65cd58fbadf3",
    //     name: "Football"
    //   },
    //   server_member: [
    //     {
    //       public_id: "member_aa06ec70-d773-4156-a369-2af0d714d53c",
    //       nickname: "John DoDo",
    //       avatar: null
    //     }
    //   ],
    //   enums: [
    //     {
    //       enum_definition_name: "Fun Level",
    //       values: {
    //         value1: "Fun",
    //         value2: "Neutral",
    //         value3: "Boring",
    //         value4: null,
    //         value5: null
    //       },
    //       selected_key: "value3"
    //     }
    //   ],
    //   likes_count: 0,
    //   liked_by_me: false
    // }
}
```

### 2. List Sessions (with Pagination)

```typescript
// List first page with default limit
const result = await window.api.session.list('srv_123', undefined, accessToken)

// List with custom pagination
const paginatedResult = await window.api.session.list(
    'srv_123',
    {
        page: 1,
        limit: 10
    },
    accessToken
)

if (paginatedResult.error) {
    console.error('Error listing sessions:', paginatedResult.error)
} else {
    console.log('Sessions:', paginatedResult.data)
    // paginatedResult.data structure:
    // {
    //   total: 42,
    //   page: 1,
    //   limit: 10,
    //   pageCount: 5,
    //   data: [ ...sessions array... ]
    // }
}
```

### 3. Get Session Details

```typescript
const result = await window.api.session.getById(
    'srv_123', // servers ID
    'activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce', // session ID
    accessToken
)

if (result.error) {
    console.error('Error getting session:', result.error)
} else {
    console.log('Session details:', result.data)
}
```

### 4. Update Session (Creator Only)

```typescript
const result = await window.api.session.update(
    'srv_123', // servers ID
    'activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce', // session ID
    {
        duration: 45, // Updated duration
        participants: ['member_123e4567-e89b-12d3-a456-426614174000']
    },
    accessToken
)

if (result.error) {
    console.error('Error updating session:', result.error)
} else {
    console.log('Session updated:', result.data)
}
```

### 5. Delete Session (Creator Only)

```typescript
const result = await window.api.session.delete(
    'srv_123', // servers ID
    'activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce', // session ID
    accessToken
)

if (result.error) {
    console.error('Error deleting session:', result.error)
} else {
    console.log('Session deleted successfully')
}
```

### 6. Like a Session

```typescript
const result = await window.api.session.like(
    'srv_123', // servers ID
    'activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce', // session ID
    accessToken
)

if (result.error) {
    console.error('Error liking session:', result.error)
} else {
    console.log('Session liked successfully')
}
```

### 7. Unlike a Session

```typescript
const result = await window.api.session.unlike(
    'srv_123', // servers ID
    'activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce', // session ID
    accessToken
)

if (result.error) {
    console.error('Error unliking session:', result.error)
} else {
    console.log('Session unliked successfully')
}
```

## Vue Composable Example

Create a comprehensive composable for managing sessions:

```typescript
// src/renderer/src/composables/sessions/useSessions.ts
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'
import type {
    ISession,
    IPaginatedSessions,
    ICreateSessionRequest,
    IUpdateSessionRequest,
    IListSessionsOptions
} from '@shared/contracts/interfaces/session.interfaces'

export function useSessions(serverId: string) {
    const { session: authSession } = useAuth()
    const sessions = ref<ISession[]>([])
    const pagination = ref<Omit<IPaginatedSessions, 'data'> | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const accessToken = computed(() => authSession.value?.access_token || '')

    // Load sessions with pagination
    async function loadSessions(options?: IListSessionsOptions) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.session.list(serverId, options, accessToken.value)

            if (result.error) {
                error.value = result.error
            } else if (result.data) {
                sessions.value = result.data.data
                pagination.value = {
                    total: result.data.total,
                    page: result.data.page,
                    limit: result.data.limit,
                    pageCount: result.data.pageCount
                }
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
        } finally {
            loading.value = false
        }
    }

    // Create session
    async function createSession(request: ICreateSessionRequest) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.session.create(serverId, request, accessToken.value)

            if (result.error) {
                error.value = result.error
                return null
            } else {
                // Reload sessions to get updated list
                await loadSessions()
                return result.data
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return null
        } finally {
            loading.value = false
        }
    }

    // Get session by ID
    async function getSession(sessionId: string) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.session.getById(serverId, sessionId, accessToken.value)

            if (result.error) {
                error.value = result.error
                return null
            } else {
                return result.data
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return null
        } finally {
            loading.value = false
        }
    }

    // Update session
    async function updateSession(sessionId: string, request: IUpdateSessionRequest) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return null
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.session.update(
                serverId,
                sessionId,
                request,
                accessToken.value
            )

            if (result.error) {
                error.value = result.error
                return null
            } else {
                // Update local list
                const index = sessions.value.findIndex((s) => s.public_id === sessionId)
                if (index !== -1 && result.data) {
                    sessions.value[index] = result.data
                }
                return result.data
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return null
        } finally {
            loading.value = false
        }
    }

    // Delete session
    async function deleteSession(sessionId: string) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return false
        }

        loading.value = true
        error.value = null

        try {
            const result = await window.api.session.delete(serverId, sessionId, accessToken.value)

            if (result.error) {
                error.value = result.error
                return false
            } else {
                // Remove from local list
                sessions.value = sessions.value.filter((s) => s.public_id !== sessionId)
                return true
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return false
        } finally {
            loading.value = false
        }
    }

    // Toggle like on a session
    async function toggleLike(sessionId: string, currentlyLiked: boolean) {
        if (!accessToken.value) {
            error.value = 'Not authenticated'
            return false
        }

        try {
            const result = currentlyLiked
                ? await window.api.session.unlike(serverId, sessionId, accessToken.value)
                : await window.api.session.like(serverId, sessionId, accessToken.value)

            if (result.error) {
                error.value = result.error
                return false
            } else {
                // Update local session
                const session = sessions.value.find((s) => s.public_id === sessionId)
                if (session) {
                    session.liked_by_me = !currentlyLiked
                    session.likes_count += currentlyLiked ? -1 : 1
                }
                return true
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error'
            return false
        }
    }

    return {
        sessions,
        pagination,
        loading,
        error,
        loadSessions,
        createSession,
        getSession,
        updateSession,
        deleteSession,
        toggleLike
    }
}
```

## Response Types

### ISession

```typescript
{
  public_id: string                     // e.g., "activitysession_69dea6ea-7346-4976-ae50-6f00392c8fce"
  date: string                          // ISO 8601 timestamp
  duration: string                      // Duration in minutes (as string)
  activity: ISessionActivity            // Activity reference
  server_member: ISessionMember[]       // Participants
  enums: ISessionEnum[]                 // Enum values
  likes_count: number                   // Total likes
  liked_by_me: boolean                  // Whether current user liked
}
```

### IPaginatedSessions

```typescript
{
  total: number        // Total number of sessions
  page: number         // Current page number
  limit: number        // Items per page
  pageCount: number    // Total number of pages
  data: ISession[]     // Array of sessions
}
```

### ICreateSessionRequest

```typescript
{
  activity_id: string                      // Required activity ID
  duration: number                         // Duration in minutes
  date: string                             // ISO 8601 date
  participants: string[]                   // Array of member IDs
  enums?: ICreateSessionEnumRequest[]      // Optional enum values
}
```

### ICreateSessionEnumRequest

```typescript
{
    enum_value_id: string // Enum value ID
    selected_key: string // Selected key (value1, value2, etc.)
}
```

## Pagination Example

```typescript
// Load first page
await loadSessions({ page: 1, limit: 10 })

// Load next page
if (pagination.value && pagination.value.page < pagination.value.pageCount) {
    await loadSessions({
        page: pagination.value.page + 1,
        limit: pagination.value.limit
    })
}

// Calculate if there are more pages
const hasNextPage = computed(() => {
    return pagination.value && pagination.value.page < pagination.value.pageCount
})

const hasPrevPage = computed(() => {
    return pagination.value && pagination.value.page > 1
})
```

## Error Handling

All API calls return an object with either `data` or `error`:

```typescript
// Success
{
    data: ISession
}

// Error
{
    error: 'Error message'
}
```

Common errors:

- `"Server ID is required"` - Missing server ID
- `"Session ID is required"` - Missing session ID
- `"Activity ID is required"` - Missing activity ID
- `"Duration must be greater than 0"` - Invalid duration
- `"Date is required"` - Missing date
- `"At least one participant is required"` - No participants
- `"Authentication required"` - Missing or invalid access token
- `"Forbidden - Insufficient permissions"` - Not server creator (for update/delete)

## Permissions

- **Create**: Any server member
- **List**: All server members
- **Get Details**: All server members
- **Update**: Only server creator
- **Delete**: Only server creator
- **Like/Unlike**: All server members

## Best Practices

1. **Pagination**: Always implement pagination for performance
2. **Optimistic Updates**: Update UI immediately, revert on error
3. **Date Handling**: Always use ISO 8601 format for dates
4. **Duration**: Store as minutes for consistency
5. **Participants**: Validate member IDs exist in server
6. **Enum Values**: Ensure enum definitions exist before creating session
7. **Like Toggling**: Use `toggleLike` function to handle both states
8. **Error Boundaries**: Wrap API calls in try-catch blocks
9. **Loading States**: Show spinners during operations
10. **Refresh After Mutations**: Reload list after create/update/delete

## Date and Time Handling

```typescript
// Create a session for now
const now = new Date().toISOString()

// Create a session for specific date/time
const specificDate = new Date('2025-09-24T15:00:00').toISOString()

// Format date for display
function formatSessionDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
```

## Integration Example: Session Feed

```vue
<template>
    <div class="session-feed">
        <div v-for="session in sessions" :key="session.public_id" class="session-card">
            <div class="session-header">
                <h3>{{ session.activity.name }}</h3>
                <span>{{ formatDate(session.date) }}</span>
            </div>

            <div class="session-info">
                <span>Duration: {{ session.duration }} minutes</span>
            </div>

            <div class="participants">
                <span v-for="member in session.server_member" :key="member.public_id">
                    {{ member.nickname }}
                </span>
            </div>

            <div v-if="session.enums.length > 0" class="enums">
                <div v-for="(enumVal, idx) in session.enums" :key="idx">
                    <strong>{{ enumVal.enum_definition_name }}:</strong>
                    {{ enumVal.values[enumVal.selected_key] }}
                </div>
            </div>

            <div class="session-actions">
                <button
                    @click="toggleLike(session.public_id, session.liked_by_me)"
                    :class="{ liked: session.liked_by_me }"
                >
                    {{ session.liked_by_me ? '❤️' : '🤍' }} {{ session.likes_count }}
                </button>
                <button @click="editSession(session)">Edit</button>
                <button @click="deleteSessionConfirm(session.public_id)">Delete</button>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination" class="pagination">
            <button
                @click="loadSessions({ page: pagination.page - 1, limit: pagination.limit })"
                :disabled="!hasPrevPage"
            >
                Previous
            </button>
            <span>Page {{ pagination.page }} of {{ pagination.pageCount }}</span>
            <button
                @click="loadSessions({ page: pagination.page + 1, limit: pagination.limit })"
                :disabled="!hasNextPage"
            >
                Next
            </button>
        </div>
    </div>
</template>
```

## Performance Considerations

1. **Lazy Loading**: Load sessions on demand, not all at once
2. **Caching**: Cache session details to avoid redundant requests
3. **Debouncing**: Debounce pagination controls
4. **Virtual Scrolling**: Use for large lists of sessions
5. **Batch Operations**: Group multiple operations when possible

## Testing Checklist

- [ ] Create session with all fields
- [ ] Create session with minimal fields (no enums)
- [ ] List sessions with default pagination
- [ ] List sessions with custom page/limit
- [ ] Navigate through multiple pages
- [ ] Get specific session details
- [ ] Update session (as creator)
- [ ] Delete session (as creator)
- [ ] Like a session
- [ ] Unlike a session
- [ ] Verify like count updates
- [ ] Verify error handling for non-creator updates
- [ ] Test with invalid dates
- [ ] Test with empty participants array
- [ ] Test pagination edge cases (last page, page > pageCount)
