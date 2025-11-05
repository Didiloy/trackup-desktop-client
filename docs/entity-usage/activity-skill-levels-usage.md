# Activity Skill Levels API - Usage Guide

## Overview

The activity skill levels API allows you to manage custom skill level definitions for specific activities within a server. Skill levels define progression tiers based on sessions count and duration. Only the server creator can create, update, or delete skill levels.

## Available Operations

### 1. Create Skill Level

```typescript
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const accessToken = session.value?.access_token

const result = await window.api.activitySkillLevel.create(
  'srv_123', // servers ID
  'activity_456', // activity ID
  {
    name: 'Beginner',
    display_order: 1,
    min_sessions: 0,
    max_sessions: 10,
    min_duration: 0,
    max_duration: 300, // 5 hours in minutes
    description: 'New to this activity',
    color: '#4CAF50'
  },
  accessToken
)

if (result.error) {
  console.error('Error creating skill level:', result.error)
} else {
  console.log('Skill level created:', result.data)
  // result.data structure:
  // {
  //   public_id: "sklvl_123",
  //   name: "Beginner",
  //   display_order: 1,
  //   min_sessions: 0,
  //   max_sessions: 10,
  //   min_duration: 0,
  //   max_duration: 300,
  //   description: "New to this activity",
  //   color: "#4CAF50",
  //   created_at: "2025-11-03T09:13:25.622Z",
  //   updated_at: "2025-11-03T09:13:25.622Z"
  // }
}
```

### 2. List All Skill Levels

```typescript
const result = await window.api.activitySkillLevel.list(
  'srv_123', // servers ID
  'activity_456', // activity ID
  accessToken
)

if (result.error) {
  console.error('Error listing skill levels:', result.error)
} else {
  console.log('Skill levels:', result.data)
  // result.data is an array of IActivitySkillLevel, ordered by display_order
}
```

### 3. Get Skill Level Details

```typescript
const result = await window.api.activitySkillLevel.getById(
  'srv_123', // servers ID
  'activity_456', // activity ID
  'sklvl_123', // skill level ID
  accessToken
)

if (result.error) {
  console.error('Error getting skill level:', result.error)
} else {
  console.log('Skill level details:', result.data)
}
```

### 4. Update Skill Level (Creator Only)

```typescript
const result = await window.api.activitySkillLevel.update(
  'srv_123', // servers ID
  'activity_456', // activity ID
  'sklvl_123', // skill level ID
  {
    name: 'Novice',
    max_sessions: 15, // Updated from 10
    description: 'Updated description',
    color: '#66BB6A'
  },
  accessToken
)

if (result.error) {
  console.error('Error updating skill level:', result.error)
} else {
  console.log('Skill level updated:', result.data)
}
```

### 5. Delete Skill Level (Creator Only)

```typescript
const result = await window.api.activitySkillLevel.delete(
  'srv_123', // servers ID
  'activity_456', // activity ID
  'sklvl_123', // skill level ID
  accessToken
)

if (result.error) {
  console.error('Error deleting skill level:', result.error)
} else {
  console.log('Skill level deleted successfully')
}
```

## Vue Composable Example

Create a composable for managing skill levels:

```typescript
// src/renderer/src/composables/skill-levels/useActivitySkillLevels.ts
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'
import type {
  IActivitySkillLevel,
  ICreateActivitySkillLevelRequest,
  IUpdateActivitySkillLevelRequest
} from '@shared/contracts/interfaces/activity-skill-level.interfaces'

export function useActivitySkillLevels(serverId: string, activityId: string) {
  const { session } = useAuth()
  const skillLevels = ref<IActivitySkillLevel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const accessToken = computed(() => session.value?.access_token || '')

  // Computed: sorted skill levels by display order
  const sortedSkillLevels = computed(() => {
    return [...skillLevels.value].sort((a, b) => a.display_order - b.display_order)
  })

  // Load skill levels
  async function loadSkillLevels() {
    if (!accessToken.value) {
      error.value = 'Not authenticated'
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await window.api.activitySkillLevel.list(
        serverId,
        activityId,
        accessToken.value
      )

      if (result.error) {
        error.value = result.error
      } else {
        skillLevels.value = result.data || []
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  // Create skill level
  async function createSkillLevel(request: ICreateActivitySkillLevelRequest) {
    if (!accessToken.value) {
      error.value = 'Not authenticated'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const result = await window.api.activitySkillLevel.create(
        serverId,
        activityId,
        request,
        accessToken.value
      )

      if (result.error) {
        error.value = result.error
        return null
      } else {
        // Add to local list
        if (result.data) {
          skillLevels.value.push(result.data)
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

  // Get skill level by ID
  async function getSkillLevel(skillLevelId: string) {
    if (!accessToken.value) {
      error.value = 'Not authenticated'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const result = await window.api.activitySkillLevel.getById(
        serverId,
        activityId,
        skillLevelId,
        accessToken.value
      )

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

  // Update skill level
  async function updateSkillLevel(skillLevelId: string, request: IUpdateActivitySkillLevelRequest) {
    if (!accessToken.value) {
      error.value = 'Not authenticated'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const result = await window.api.activitySkillLevel.update(
        serverId,
        activityId,
        skillLevelId,
        request,
        accessToken.value
      )

      if (result.error) {
        error.value = result.error
        return null
      } else {
        // Update local list
        const index = skillLevels.value.findIndex((sl) => sl.public_id === skillLevelId)
        if (index !== -1 && result.data) {
          skillLevels.value[index] = result.data
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

  // Delete skill level
  async function deleteSkillLevel(skillLevelId: string) {
    if (!accessToken.value) {
      error.value = 'Not authenticated'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await window.api.activitySkillLevel.delete(
        serverId,
        activityId,
        skillLevelId,
        accessToken.value
      )

      if (result.error) {
        error.value = result.error
        return false
      } else {
        // Remove from local list
        skillLevels.value = skillLevels.value.filter((sl) => sl.public_id !== skillLevelId)
        return true
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    skillLevels,
    sortedSkillLevels,
    loading,
    error,
    loadSkillLevels,
    createSkillLevel,
    getSkillLevel,
    updateSkillLevel,
    deleteSkillLevel
  }
}
```

## Vue Component Example

```vue
<template>
  <div class="skill-levels-manager">
    <h2>Skill Levels for {{ activityName }}</h2>

    <button @click="loadSkillLevels" :disabled="loading">
      {{ loading ? 'Loading...' : 'Refresh' }}
    </button>

    <div v-if="error" class="error">{{ error }}</div>

    <!-- Skill Levels List -->
    <div class="skill-levels-list">
      <div
        v-for="level in sortedSkillLevels"
        :key="level.public_id"
        class="skill-level-card"
        :style="{ borderLeftColor: level.color || '#ccc' }"
      >
        <div class="level-header">
          <span class="level-order">{{ level.display_order }}</span>
          <h3>{{ level.name }}</h3>
          <span v-if="level.color" class="color-badge" :style="{ backgroundColor: level.color }">
          </span>
        </div>
        <p v-if="level.description" class="level-description">{{ level.description }}</p>
        <div class="level-stats">
          <div class="stat">
            <label>Sessions:</label>
            <span> {{ level.min_sessions }} - {{ level.max_sessions ?? '∞' }} </span>
          </div>
          <div class="stat">
            <label>Duration:</label>
            <span>
              {{ formatDuration(level.min_duration) }} -
              {{ level.max_duration ? formatDuration(level.max_duration) : '∞' }}
            </span>
          </div>
        </div>
        <div class="level-actions">
          <button @click="editLevel(level)" :disabled="loading">Edit</button>
          <button @click="removeLevel(level.public_id)" :disabled="loading">Delete</button>
        </div>
        <div class="level-dates">
          <small>Created: {{ formatDate(level.created_at) }}</small>
          <small>Updated: {{ formatDate(level.updated_at) }}</small>
        </div>
      </div>

      <div v-if="sortedSkillLevels.length === 0 && !loading" class="no-levels">
        No skill levels defined
      </div>
    </div>

    <!-- Create/Edit Form -->
    <div class="level-form">
      <h3>{{ editingLevel ? 'Edit Skill Level' : 'Create New Skill Level' }}</h3>

      <div class="form-group">
        <label>Name *</label>
        <input v-model="formData.name" placeholder="e.g., Beginner" required />
      </div>

      <div class="form-group">
        <label>Display Order *</label>
        <input v-model.number="formData.display_order" type="number" min="0" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Min Sessions *</label>
          <input v-model.number="formData.min_sessions" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>Max Sessions</label>
          <input
            v-model.number="formData.max_sessions"
            type="number"
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Min Duration (minutes) *</label>
          <input v-model.number="formData.min_duration" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>Max Duration (minutes)</label>
          <input
            v-model.number="formData.max_duration"
            type="number"
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea
          v-model="formData.description"
          placeholder="Describe this skill level..."
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Color</label>
        <input v-model="formData.color" type="color" />
      </div>

      <div class="form-actions">
        <button @click="saveLevel" :disabled="loading || !isFormValid">
          {{ editingLevel ? 'Update' : 'Create' }}
        </button>
        <button v-if="editingLevel" @click="cancelEdit" :disabled="loading">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useActivitySkillLevels } from '@/composables/skill-levels/useActivitySkillLevels'
import type { IActivitySkillLevel } from '@shared/contracts/interfaces/activity-skill-level.interfaces'

const props = defineProps<{
  serverId: string
  activityId: string
  activityName: string
}>()

const {
  sortedSkillLevels,
  loading,
  error,
  loadSkillLevels,
  createSkillLevel,
  updateSkillLevel,
  deleteSkillLevel
} = useActivitySkillLevels(props.serverId, props.activityId)

const editingLevel = ref<IActivitySkillLevel | null>(null)
const formData = ref({
  name: '',
  display_order: 1,
  min_sessions: 0,
  max_sessions: null as number | null,
  min_duration: 0,
  max_duration: null as number | null,
  description: '',
  color: '#4CAF50'
})

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() &&
    formData.value.display_order >= 0 &&
    formData.value.min_sessions >= 0 &&
    formData.value.min_duration >= 0
  )
})

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

async function saveLevel() {
  const data = {
    ...formData.value,
    max_sessions: formData.value.max_sessions || undefined,
    max_duration: formData.value.max_duration || undefined
  }

  if (editingLevel.value) {
    const result = await updateSkillLevel(editingLevel.value.public_id, data)
    if (result) {
      resetForm()
    }
  } else {
    const result = await createSkillLevel(data)
    if (result) {
      resetForm()
    }
  }
}

function editLevel(level: IActivitySkillLevel) {
  editingLevel.value = level
  formData.value = {
    name: level.name,
    display_order: level.display_order,
    min_sessions: level.min_sessions,
    max_sessions: level.max_sessions,
    min_duration: level.min_duration,
    max_duration: level.max_duration,
    description: level.description || '',
    color: level.color || '#4CAF50'
  }
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  editingLevel.value = null
  formData.value = {
    name: '',
    display_order: sortedSkillLevels.value.length + 1,
    min_sessions: 0,
    max_sessions: null,
    min_duration: 0,
    max_duration: null,
    description: '',
    color: '#4CAF50'
  }
}

async function removeLevel(id: string) {
  if (confirm('Are you sure you want to delete this skill level?')) {
    await deleteSkillLevel(id)
  }
}

onMounted(() => {
  loadSkillLevels()
})
</script>

<style scoped>
.skill-levels-manager {
  padding: 20px;
}

.error {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
}

.skill-levels-list {
  margin: 20px 0;
  display: grid;
  gap: 15px;
}

.skill-level-card {
  border: 1px solid #ccc;
  border-left-width: 4px;
  padding: 20px;
  border-radius: 5px;
  background: white;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.level-order {
  background: #2196f3;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.level-header h3 {
  flex: 1;
  margin: 0;
}

.color-badge {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.level-description {
  color: #666;
  margin: 10px 0;
}

.level-stats {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.stat label {
  font-weight: bold;
  margin-right: 5px;
}

.level-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.level-dates {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.level-dates small {
  color: #999;
}

.no-levels {
  text-align: center;
  padding: 40px;
  color: #999;
}

.level-form {
  border-top: 2px solid #ccc;
  margin-top: 30px;
  padding-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #1976d2;
}
</style>
```

## Response Types

### IActivitySkillLevel

```typescript
{
  public_id: string // e.g., "sklvl_123"
  name: string // e.g., "Beginner"
  display_order: number // Ordering (1, 2, 3...)
  min_sessions: number // Minimum sessions required
  max_sessions: number | null // Maximum sessions (null = unlimited)
  min_duration: number // Minimum total duration in minutes
  max_duration: number | null // Maximum total duration in minutes (null = unlimited)
  description: string | null // Optional description
  color: string | null // Optional hex color (e.g., "#4CAF50")
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
}
```

## Use Cases

### 1. Gaming Skill Progression

```typescript
// Beginner: 0-10 sessions, 0-5 hours
await window.api.activitySkillLevel.create(
  serverId,
  activityId,
  {
    name: 'Beginner',
    display_order: 1,
    min_sessions: 0,
    max_sessions: 10,
    min_duration: 0,
    max_duration: 300,
    color: '#4CAF50'
  },
  accessToken
)

// Intermediate: 11-50 sessions, 5-50 hours
await window.api.activitySkillLevel.create(
  serverId,
  activityId,
  {
    name: 'Intermediate',
    display_order: 2,
    min_sessions: 11,
    max_sessions: 50,
    min_duration: 301,
    max_duration: 3000,
    color: '#FFC107'
  },
  accessToken
)

// Expert: 51+ sessions, 50+ hours
await window.api.activitySkillLevel.create(
  serverId,
  activityId,
  {
    name: 'Expert',
    display_order: 3,
    min_sessions: 51,
    max_sessions: null, // unlimited
    min_duration: 3001,
    max_duration: null, // unlimited
    color: '#F44336'
  },
  accessToken
)
```

### 2. Fitness Tracking

```typescript
// Casual: 0-20 sessions
await window.api.activitySkillLevel.create(
  serverId,
  activityId,
  {
    name: 'Casual',
    display_order: 1,
    min_sessions: 0,
    max_sessions: 20,
    min_duration: 0,
    max_duration: 600, // 10 hours
    description: 'Just getting started with fitness',
    color: '#E3F2FD'
  },
  accessToken
)
```

## Error Handling

All API calls return an object with either `data` or `error`:

```typescript
// Success
{
  data: IActivitySkillLevel
}

// Error
{
  error: 'Error message'
}
```

Common errors:

- `"Server ID is required"` - Missing server ID parameter
- `"Activity ID is required"` - Missing activity ID parameter
- `"Skill level ID is required"` - Missing skill level ID parameter
- `"Skill level name is required"` - Missing required name field
- `"Display order is required"` - Missing required display_order field
- `"Minimum sessions is required"` - Missing required min_sessions field
- `"Minimum duration is required"` - Missing required min_duration field
- `"Authentication required"` - Missing or invalid access token
- `"Forbidden - Insufficient permissions"` - User is not the server creator
- `"Resource not found"` - Skill level doesn't exist

## Permissions

- **Create**: Only server creator
- **List**: All server members
- **Get Details**: All server members
- **Update**: Only server creator
- **Delete**: Only server creator

## Best Practices

1. **Display Order**: Use incremental values (1, 2, 3...) for easy reordering
2. **Unlimited Values**: Set `max_sessions` or `max_duration` to `null` for unlimited tiers
3. **Color Coding**: Use consistent color schemes (green for beginner, yellow for intermediate, red for expert)
4. **Duration Units**: Store duration in minutes for consistency
5. **Validation**: Ensure min values are less than max values
6. **User Feedback**: Show clear progression indicators based on skill levels
7. **Gap Prevention**: Ensure ranges don't have gaps (e.g., 0-10, 11-20, not 0-10, 15-20)

## Integration Example

Use skill levels to determine user's current skill:

```typescript
function determineSkillLevel(
  skillLevels: IActivitySkillLevel[],
  userSessions: number,
  userDuration: number
): IActivitySkillLevel | null {
  const sorted = [...skillLevels].sort((a, b) => a.display_order - b.display_order)

  for (const level of sorted) {
    const sessionMatch =
      userSessions >= level.min_sessions &&
      (level.max_sessions === null || userSessions <= level.max_sessions)

    const durationMatch =
      userDuration >= level.min_duration &&
      (level.max_duration === null || userDuration <= level.max_duration)

    if (sessionMatch && durationMatch) {
      return level
    }
  }

  return null
}

// Usage
const userLevel = determineSkillLevel(sortedSkillLevels.value, 25, 1500)
if (userLevel) {
  console.log(`User is at ${userLevel.name} level`)
}
```
