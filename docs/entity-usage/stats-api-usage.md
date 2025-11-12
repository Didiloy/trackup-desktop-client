# Statistics API Implementation Guide

## Overview

This document provides a complete guide for using the statistics API in the TrackUp Desktop Client. The implementation is organized into three main stat entities:

1. **Server Stats** - Global server statistics and analytics
2. **Member Stats** - Individual and aggregate member statistics
3. **Activity Stats** - Activity popularity and engagement metrics

Each entity is implemented in dedicated, optimized files for maintainability and scalability.

## Architecture

### File Organization

```
src/
├── shared/contracts/
│   ├── interfaces/
│   │   ├── server-stats.interfaces.ts     # Server stats types
│   │   ├── member-stats.interfaces.ts     # Member stats types
│   │   └── activity-stats.interfaces.ts   # Activity stats types
│   └── ipc-channels/types/
│       ├── server-stats.channels.ts                # Server stats channels
│       ├── member-stats.channels.ts                # Member stats channels
│       └── activity-stats.channels.ts              # Activity stats channels
├── main/ipc/
│   ├── server-stats.ipc.ts                # Server stats handlers
│   ├── member-stats.ipc.ts                # Member stats handlers
│   └── activity-stats.ipc.ts              # Activity stats handlers
└── preload/bridges/
    ├── server-stats.bridge.ts             # Server stats bridge
    ├── member-stats.bridge.ts             # Member stats bridge
    └── activity-stats.bridge.ts           # Activity stats bridge
```

## Server Statistics

### Available Methods

#### 1. Get Server Statistics

```typescript
window.api.serverStats.getStats(serverId, accessToken)
```

Returns global server statistics including sessions, members, activities, and engagement.

**Example:**

```typescript
const { session } = useAuth()
const result = await window.api.serverStats.getStats('srv_123', session.value?.access_token)

if (result.data) {
    console.log('Total sessions:', result.data.total_sessions)
    console.log('Active members:', result.data.active_members)
}
```

#### 2. Get Complete Server Details

```typescript
window.api.serverStats.getDetails(serverId, accessToken)
```

Returns comprehensive stats including top members, top activities, and timeline.

**Example:**

```typescript
const details = await window.api.serverStats.getDetails('srv_123', accessToken)

if (details.data) {
    console.log('Server stats:', details.data.server_stats)
    console.log('Top members:', details.data.top_members)
    console.log('Top activities:', details.data.top_activities)
    console.log('Timeline:', details.data.timeline)
}
```

#### 3. Get Server Timeline

```typescript
window.api.serverStats.getTimeline(serverId, params, accessToken)
```

Returns timeline statistics showing evolution over time.

**Parameters:**

- `period`: 'all_time' | 'daily' | 'weekly' | 'monthly' | 'yearly'
- `limit`: Number of periods (default: 30, max: 365)
- `isoWeek`: Use ISO week (Monday) for fallback (default: true)

**Example:**

```typescript
const timeline = await window.api.serverStats.getTimeline(
    'srv_123',
    { period: 'weekly', limit: 12 },
    accessToken
)

if (timeline.data) {
    timeline.data.forEach((point) => {
        console.log(`${point.period}: ${point.sessions_count} sessions`)
    })
}
```

#### 4. Get Growth Trends

```typescript
window.api.serverStats.getGrowthTrends(serverId, params, accessToken)
```

Returns growth metrics comparing current period to previous.

**Example:**

```typescript
const growth = await window.api.serverStats.getGrowthTrends(
    'srv_123',
    { period: 'weekly' },
    accessToken
)

if (growth.data) {
    console.log('Sessions growth:', growth.data.sessions.change_percent + '%')
    console.log('MembersAside growth:', growth.data.members.change_percent + '%')
}
```

#### 5. Get Comparative Analysis

```typescript
window.api.serverStats.getComparativeAnalysis(serverId, accessToken)
```

Returns comparative analysis across different time periods.

---

## Member Statistics

### Available Methods

#### 1. Get Member Leaderboard

```typescript
window.api.memberStats.getLeaderboard(serverId, params, accessToken)
```

Returns top members by total duration.

**Parameters:**

- `period`: 'all_time' | 'daily' | 'weekly' | 'monthly'
- `limit`: Maximum number of results

**Example:**

```typescript
const leaderboard = await window.api.memberStats.getLeaderboard(
    'srv_123',
    { period: 'weekly', limit: 10 },
    accessToken
)

if (leaderboard.data) {
    leaderboard.data.leaderboard.forEach((entry) => {
        console.log(`${entry.rank}. ${entry.member_name} - ${entry.total_duration}s`)
    })
}
```

#### 2. Get All Members Statistics

```typescript
window.api.memberStats.getAllStats(serverId, params, accessToken)
```

Returns paginated list of all member statistics.

**Parameters:**

- `page`: Page number (must be >= 1)
- `limit`: Items per page (must be >= 1)

**Example:**

```typescript
const members = await window.api.memberStats.getAllStats(
    'srv_123',
    { page: 1, limit: 20 },
    accessToken
)

if (members.data) {
    console.log(`Page ${members.data.page} of ${members.data.pageCount}`)
    members.data.data.forEach((member) => {
        console.log(member.user_email, member.total_sessions)
    })
}
```

#### 3. Get Member Statistics

```typescript
window.api.memberStats.getStats(serverId, memberId, accessToken)
```

Returns detailed stats for a specific member. Use 'me' as memberId for own stats.

**Example:**

```typescript
// Get own stats
const myStats = await window.api.memberStats.getStats('srv_123', 'me', accessToken)

// Get specific member stats
const memberStats = await window.api.memberStats.getStats('srv_123', 'mem_456', accessToken)
```

#### 4. Get Complete Member Details

```typescript
window.api.memberStats.getDetails(serverId, memberId, accessToken)
```

Returns comprehensive details including stats, patterns, ranking, and timeline.

**Example:**

```typescript
const details = await window.api.memberStats.getDetails('srv_123', 'me', accessToken)

if (details.data) {
    console.log('Stats:', details.data)
    console.log('Patterns:', details.data.patterns)
    console.log('Ranking:', details.data.ranking)
    console.log('Timeline:', details.data.timeline)
}
```

#### 5. Get Activity Patterns

```typescript
window.api.memberStats.getPatterns(serverId, memberId, accessToken)
```

Returns activity patterns including most active day, hour, and streaks.

**Example:**

```typescript
const patterns = await window.api.memberStats.getPatterns('srv_123', 'me', accessToken)

if (patterns.data) {
    console.log('Most active day:', patterns.data.most_active_day_of_week)
    console.log('Most active hour:', patterns.data.most_active_hour)
    console.log('Current streak:', patterns.data.streak_current)
}
```

#### 6. Get Member Ranking

```typescript
window.api.memberStats.getRanking(serverId, memberId, accessToken)
```

Returns member's rank and percentile in the server.

**Example:**

```typescript
const ranking = await window.api.memberStats.getRanking('srv_123', 'me', accessToken)

if (ranking.data) {
    console.log(`Rank: ${ranking.data.rank_in_server} / ${ranking.data.total_members}`)
    console.log(`Percentile: ${ranking.data.percentile}`)
}
```

#### 7. Get Member Timeline

```typescript
window.api.memberStats.getTimeline(serverId, memberId, params, accessToken)
```

Returns timeline showing member activity evolution.

#### 8. Get Member Growth Trends

```typescript
window.api.memberStats.getGrowthTrends(serverId, memberId, params, accessToken)
```

Returns member growth metrics over time.

---

## Activity Statistics

### Available Methods

#### 1. Get Activity Leaderboard

```typescript
window.api.activityStats.getLeaderboard(serverId, params, accessToken)
```

Returns top activities by popularity score.

**Example:**

```typescript
const leaderboard = await window.api.activityStats.getLeaderboard(
    'srv_123',
    { period: 'monthly', limit: 10 },
    accessToken
)

if (leaderboard.data) {
    leaderboard.data.leaderboard.forEach((activity) => {
        console.log(`${activity.rank}. ${activity.activity_name}`)
        console.log(`  Score: ${activity.popularity_score}`)
        console.log(`  Sessions: ${activity.total_sessions}`)
    })
}
```

#### 2. Get All Activities Statistics

```typescript
window.api.activityStats.getAllStats(serverId, params, accessToken)
```

Returns paginated list of all activity statistics, sorted by popularity.

**Example:**

```typescript
const activities = await window.api.activityStats.getAllStats(
    'srv_123',
    { page: 1, limit: 20 },
    accessToken
)
```

#### 3. Get Activity Statistics

```typescript
window.api.activityStats.getStats(serverId, activityId, accessToken)
```

Returns detailed statistics for a specific activity.

**Example:**

```typescript
const stats = await window.api.activityStats.getStats('srv_123', 'act_789', accessToken)

if (stats.data) {
    console.log('Total sessions:', stats.data.total_sessions)
    console.log('Popularity score:', stats.data.popularity_score)
    console.log('Unique participants:', stats.data.unique_participants)
}
```

#### 4. Get Complete Activity Details

```typescript
window.api.activityStats.getDetails(serverId, activityId, accessToken)
```

Returns comprehensive details including stats, patterns, growth, timeline, and top contributors.

**Example:**

```typescript
const details = await window.api.activityStats.getDetails('srv_123', 'act_789', accessToken)

if (details.data) {
    console.log('Stats:', details.data)
    console.log('Time patterns:', details.data.time_patterns)
    console.log('Growth trend:', details.data.growth_trend)
    console.log('Top contributors:', details.data.top_contributors)
}
```

#### 5. Get Time Patterns

```typescript
window.api.activityStats.getPatterns(serverId, activityId, accessToken)
```

Returns activity time patterns including peak day and hour.

**Example:**

```typescript
const patterns = await window.api.activityStats.getPatterns('srv_123', 'act_789', accessToken)

if (patterns.data) {
    console.log('Peak day of week:', patterns.data.peak_day_of_week)
    console.log('Peak hour:', patterns.data.peak_hour)
    console.log('Current streak:', patterns.data.streak_current)
}
```

#### 6. Get Activity Ranking

```typescript
window.api.activityStats.getRanking(serverId, activityId, params, accessToken)
```

Returns the ranking of a specific activity based on popularity.

**Parameters:**

- `period`: Time period for ranking (default: 'all_time')

**Example:**

```typescript
const ranking = await window.api.activityStats.getRanking(
    'srv_123',
    'act_789',
    { period: 'weekly' },
    accessToken
)

if (ranking.data) {
    console.log(`Rank: ${ranking.data.rank} / ${ranking.data.total_activities}`)
    console.log(`Score: ${ranking.data.popularity_score}`)
}
```

#### 7. Get Activity Timeline

```typescript
window.api.activityStats.getTimeline(serverId, activityId, params, accessToken)
```

Returns timeline showing activity usage evolution over time.

#### 8. Get Activity Growth Trends

```typescript
window.api.activityStats.getGrowthTrends(serverId, activityId, params, accessToken)
```

Returns activity growth metrics over time.

---

## Common Patterns

### Error Handling

All methods return a response with `data` or `error`:

```typescript
const result = await window.api.serverStats.getStats(serverId, accessToken)

if (result.error) {
    console.error('Error:', result.error)
    // Handle error
} else if (result.data) {
    console.log('Success:', result.data)
    // Use data
}
```

### Using with Vue Composables

```typescript
// In a Vue component
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const serverStats = ref(null)
const loading = ref(false)
const error = ref(null)

const loadServerStats = async () => {
  loading.value = true
  error.value = null

  const result = await window.api.serverStats.getStats(
    'srv_123',
    session.value?.access_token
  )

  if (result.error) {
    error.value = result.error
  } else {
    serverStats.value = result.data
  }

  loading.value = false
}

onMounted(() => {
  loadServerStats()
})
</script>
```

### Pagination Helper

```typescript
const loadPage = async (page: number, limit: number = 20) => {
    const result = await window.api.memberStats.getAllStats(serverId, { page, limit }, accessToken)

    if (result.data) {
        return {
            items: result.data.data,
            total: result.data.total,
            pageCount: result.data.pageCount,
            currentPage: result.data.page
        }
    }
}
```

## Benefits of This Implementation

1. **Separation of Concerns**: Each stat type has its own dedicated files
2. **Type Safety**: Full TypeScript support across all layers
3. **DRY**: Reusable ApiService for all HTTP requests
4. **Consistent**: Same pattern for all stat entities
5. **Scalable**: Easy to add new stat types or endpoints
6. **Maintainable**: Clear organization and documentation
7. **Optimized**: Efficient query parameter handling
8. **Error Handling**: Consistent error responses across all methods

---

## Member Activity Statistics

Track individual member performance and progression on specific activities.

### Available Methods

#### 1. Get All Activities for a Member

```typescript
window.api.memberActivityStats.getAllActivities(serverId, memberId, params, accessToken)
```

Returns paginated list of all activities a member has participated in, sorted by duration.

**Parameters:**

- `page`: Page number (must be >= 1)
- `limit`: Items per page (must be >= 1)

**Example:**

```typescript
const { session } = useAuth()
const result = await window.api.memberActivityStats.getAllActivities(
    'srv_123',
    'mem_456',
    { page: 1, limit: 20 },
    session.value?.access_token
)

if (result.data) {
    result.data.data.forEach((activity) => {
        console.log(`${activity.activity_name}:`)
        console.log(`  Sessions: ${activity.total_sessions}`)
        console.log(`  Duration: ${activity.total_duration}s`)
        console.log(`  Skill Level: ${activity.skill_level}`)
        console.log(`  Proficiency: ${activity.proficiency_score}`)
    })
}
```

#### 2. Get Member Activity Details

```typescript
window.api.memberActivityStats.getActivityStats(serverId, memberId, activityId, accessToken)
```

Returns detailed statistics for a member on a specific activity, including skill level and proficiency.

**Example:**

```typescript
const stats = await window.api.memberActivityStats.getActivityStats(
    'srv_123',
    'mem_456',
    'act_789',
    accessToken
)

if (stats.data) {
    console.log('Activity:', stats.data.activity_name)
    console.log('Total sessions:', stats.data.total_sessions)
    console.log('Avg duration:', stats.data.avg_session_duration)
    console.log('Skill level:', stats.data.skill_level)
    console.log('Proficiency score:', stats.data.proficiency_score)
    console.log('Sessions created:', stats.data.sessions_created)
    console.log('Total likes:', stats.data.total_likes)
}
```

#### 3. Get Activity Progression

```typescript
window.api.memberActivityStats.getActivityProgression(
    serverId,
    memberId,
    activityId,
    params,
    accessToken
)
```

Returns progression over time showing skill development.

**Parameters:**

- `period`: 'all_time' | 'daily' | 'weekly' | 'monthly' | 'yearly' (default: 'weekly')
- `limit`: Number of periods (default: 12, max: 52)

**Example:**

```typescript
const progression = await window.api.memberActivityStats.getActivityProgression(
    'srv_123',
    'mem_456',
    'act_789',
    { period: 'weekly', limit: 12 },
    accessToken
)

if (progression.data) {
    progression.data.forEach((period) => {
        console.log(`Week ${period.period_start}:`)
        console.log(`  Sessions: ${period.total_sessions}`)
        console.log(`  Skill: ${period.skill_level}`)
        console.log(`  Proficiency: ${period.proficiency_score}`)
    })
}
```

### Use Case: Member Profile Activity Tab

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const props = defineProps<{ serverId: string; memberId: string }>()

const activities = ref([])
const loading = ref(false)

const loadActivities = async () => {
  loading.value = true
  const result = await window.api.memberActivityStats.getAllActivities(
    props.serverId,
    props.memberId,
    { page: 1, limit: 10 },
    session.value?.access_token
  )

  if (result.data) {
    activities.value = result.data.data
  }
  loading.value = false
}

onMounted(() => {
  loadActivities()
})
</script>
```

---

## Enum Definition Statistics

Track usage and distribution of enum values across sessions.

### Available Methods

#### 1. Get All Enum Definitions Stats

```typescript
window.api.enumDefinitionStats.getAllStats(serverId, params, accessToken)
```

Returns paginated list of all enum definitions with usage statistics.

**Example:**

```typescript
const { session } = useAuth()
const result = await window.api.enumDefinitionStats.getAllStats(
    'srv_123',
    { page: 1, limit: 20 },
    session.value?.access_token
)

if (result.data) {
    result.data.data.forEach((enumDef) => {
        console.log(`${enumDef.enum_definition_name}:`)
        console.log(`  Total values: ${enumDef.total_values}`)
        console.log(`  Total usage: ${enumDef.total_usage}`)
        console.log(`  Sessions: ${enumDef.total_sessions}`)
        console.log(`  Unique users: ${enumDef.unique_users}`)
        console.log(`  Most used: ${enumDef.most_used_value.enum_value_id}`)
    })
}
```

#### 2. Get Enum Definition Details

```typescript
window.api.enumDefinitionStats.getStats(serverId, enumDefinitionId, params, accessToken)
```

Returns detailed statistics for a specific enum definition with all its values (paginated).

**Parameters:**

- `page`: Page number (must be >= 1)
- `limit`: Items per page (must be >= 1)
- `period`: Time period (default: 'all_time')

**Example:**

```typescript
const details = await window.api.enumDefinitionStats.getStats(
    'srv_123',
    'enumdef_456',
    { page: 1, limit: 10, period: 'weekly' },
    accessToken
)

if (details.data) {
    details.data.data.forEach((value) => {
        console.log(`${value.enum_value_display}:`)
        console.log(`  Usage: ${value.usage_count}`)
        console.log(`  Percentage: ${value.percentage_of_total}%`)
        console.log(`  Sessions: ${value.total_sessions}`)
        console.log(`  Avg likes: ${value.avg_likes_when_selected}`)
    })
}
```

#### 3. Get Value Distribution

```typescript
window.api.enumDefinitionStats.getDistribution(serverId, enumDefinitionId, accessToken)
```

Returns the distribution of values with percentages.

**Example:**

```typescript
const distribution = await window.api.enumDefinitionStats.getDistribution(
    'srv_123',
    'enumdef_456',
    accessToken
)

if (distribution.data) {
    console.log('Value:', distribution.data.enum_value_display)
    console.log('Usage:', distribution.data.usage_count)
    console.log('Percentage:', distribution.data.percentage + '%')
    console.log('Sessions:', distribution.data.total_sessions)
    console.log('Unique users:', distribution.data.unique_users)
}
```

#### 4. Get Specific Enum Value Stats

```typescript
window.api.enumDefinitionStats.getValueStats(
    serverId,
    enumDefinitionId,
    enumValueId,
    params,
    accessToken
)
```

Returns detailed statistics for a specific enum value (paginated).

**Parameters:**

- `page`: Page number (must be >= 1)
- `limit`: Items per page (must be >= 1)
- `period`: Time period (default: 'all_time')

**Example:**

```typescript
const valueStats = await window.api.enumDefinitionStats.getValueStats(
    'srv_123',
    'enumdef_456',
    'enumval_789',
    { page: 1, limit: 20, period: 'monthly' },
    accessToken
)

if (valueStats.data) {
    console.log(`Total records: ${valueStats.data.total}`)
    console.log(`Page ${valueStats.data.page} of ${valueStats.data.pageCount}`)

    valueStats.data.data.forEach((stat) => {
        console.log(`Period ${stat.period_start} to ${stat.period_end}:`)
        console.log(`  Usage: ${stat.usage_count}`)
        console.log(`  Sessions: ${stat.total_sessions}`)
        console.log(`  Duration: ${stat.total_duration}s`)
    })
}
```

### Use Case: Enum Value Distribution Chart

```typescript
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const props = defineProps<{ serverId: string; enumDefinitionId: string }>()

const enumStats = ref(null)
const loading = ref(false)

const chartData = computed(() => {
  if (!enumStats.value?.data) return []

  return enumStats.value.data.map(value => ({
    label: value.enum_value_display,
    value: value.usage_count,
    percentage: value.percentage_of_total
  }))
})

const loadEnumStats = async () => {
  loading.value = true
  const result = await window.api.enumDefinitionStats.getStats(
    props.serverId,
    props.enumDefinitionId,
    { page: 1, limit: 50 },
    session.value?.access_token
  )

  if (result.data) {
    enumStats.value = result
  }
  loading.value = false
}

onMounted(() => {
  loadEnumStats()
})
</script>
```

---

## Complete Stats Implementation Summary

### All Available Stats APIs

1. **Server Stats** (`window.api.serverStats.*`)
    - Global server analytics
    - Timeline and growth trends
    - Comparative analysis

2. **Member Stats** (`window.api.memberStats.*`)
    - Individual member statistics
    - Leaderboards and rankings
    - Activity patterns and growth

3. **Activity Stats** (`window.api.activityStats.*`)
    - Activity popularity metrics
    - Time patterns and rankings
    - Growth trends and contributors

4. **Member Activity Stats** (`window.api.memberActivityStats.*`)
    - Member performance on specific activities
    - Skill progression tracking
    - Activity participation history

5. **Enum Definition Stats** (`window.api.enumDefinitionStats.*`)
    - Enum value usage analytics
    - Distribution analysis
    - Value-specific statistics

6. **Snapshot Stats** (`window.api.snapshotStats.*`)
    - Historical stats snapshots
    - Snapshot comparisons
    - Summary and cleanup

---

## Snapshot Statistics

Track and compare server statistics over time with automatic and manual snapshots.

### Available Methods

#### 1. Create Manual Snapshot

```typescript
window.api.snapshotStats.create(serverId, request, accessToken)
```

Create a manual snapshot of current server stats. Only the server creator can create snapshots.

**Snapshot Types:**

- `daily`: Daily snapshot
- `weekly`: Weekly snapshot
- `monthly`: Monthly snapshot
- `yearly`: Yearly snapshot
- `milestone`: Milestone snapshot
- `custom`: Custom snapshot

**Example:**

```typescript
const { session } = useAuth()
const result = await window.api.snapshotStats.create(
    'srv_123',
    {
        type: 'weekly',
        description: 'End of Q4 2025 snapshot'
    },
    session.value?.access_token
)

if (result.data) {
    console.log('Snapshot created:', result.data.id)
    console.log('Snapshot date:', result.data.snapshot_date)
    console.log('Total sessions:', result.data.data.server_stats.total_sessions)
    console.log('Engagement score:', result.data.data.server_stats.engagement_score)
}
```

#### 2. Get All Snapshots

```typescript
window.api.snapshotStats.getAll(serverId, params, accessToken)
```

Returns paginated list of all snapshots with optional filtering.

**Parameters:**

- `page`: Page number (required, must be >= 1)
- `limit`: Items per page (optional)
- `type`: Filter by snapshot type (optional)
- `from_date`: Start date filter in ISO8601 format (optional)
- `to_date`: End date filter in ISO8601 format (optional)

**Example:**

```typescript
const snapshots = await window.api.snapshotStats.getAll(
    'srv_123',
    {
        page: 1,
        limit: 20,
        type: 'weekly',
        from_date: '2025-01-01T00:00:00Z',
        to_date: '2025-12-31T23:59:59Z'
    },
    accessToken
)

if (snapshots.data) {
    console.log(`Total snapshots: ${snapshots.data.total}`)
    console.log(`Page ${snapshots.data.page} of ${snapshots.data.pageCount}`)

    snapshots.data.data.forEach((snapshot) => {
        console.log(`\n${snapshot.type} snapshot - ${snapshot.snapshot_date}`)
        console.log(`  Description: ${snapshot.description}`)
        console.log(`  Sessions: ${snapshot.highlights.total_sessions}`)
        console.log(`  Members: ${snapshot.highlights.total_members}`)
        console.log(`  Engagement: ${snapshot.highlights.engagement_score}`)
        console.log(`  Change: +${snapshot.highlights.sessions_change} sessions`)
    })
}
```

#### 3. Get Specific Snapshot

```typescript
window.api.snapshotStats.getById(serverId, snapshotId, accessToken)
```

Returns complete data for a specific snapshot including all statistics.

**Example:**

```typescript
const snapshot = await window.api.snapshotStats.getById(
    'srv_123',
    'statsnapshot_abc123',
    accessToken
)

if (snapshot.data) {
    const data = snapshot.data.data

    console.log('Server Stats:', data.server_stats)
    console.log('Period Stats:', data.period_stats)
    console.log('Top MembersAside:', data.top_members)
    console.log('Top Activities:', data.top_activities)
    console.log('Top Enums:', data.top_enums)
    console.log('Trends:', data.trends)
    console.log('Metadata:', data.metadata)
}
```

#### 4. Get Latest Snapshot by Type

```typescript
window.api.snapshotStats.getLatest(serverId, params, accessToken)
```

Returns the most recent snapshot of a specific type.

**Example:**

```typescript
const latestWeekly = await window.api.snapshotStats.getLatest(
    'srv_123',
    { type: 'weekly' },
    accessToken
)

if (latestWeekly.data) {
    console.log('Latest weekly snapshot:', latestWeekly.data.snapshot_date)
    console.log('Total sessions:', latestWeekly.data.data.server_stats.total_sessions)
    console.log('Growth rate:', latestWeekly.data.data.server_stats.sessions_growth_rate)
}
```

#### 5. Get Snapshots Summary

```typescript
window.api.snapshotStats.getSummary(serverId, accessToken)
```

Returns the latest snapshot for each type (daily, weekly, monthly, yearly).

**Example:**

```typescript
const summary = await window.api.snapshotStats.getSummary('srv_123', accessToken)

if (summary.data) {
    if (summary.data.daily) {
        console.log('Daily snapshot:', summary.data.daily.snapshot_date)
    }

    if (summary.data.weekly) {
        console.log('Weekly snapshot:', summary.data.weekly.snapshot_date)
        console.log('Engagement:', summary.data.weekly.data.server_stats.engagement_score)
    }

    if (summary.data.monthly) {
        console.log('Monthly snapshot:', summary.data.monthly.snapshot_date)
    }

    if (summary.data.yearly) {
        console.log('Yearly snapshot:', summary.data.yearly.snapshot_date)
    }
}
```

#### 6. Compare Two Snapshots

```typescript
window.api.snapshotStats.compare(serverId, snapshotId1, snapshotId2, accessToken)
```

Compare two snapshots to see changes over time.

**Example:**

```typescript
const comparison = await window.api.snapshotStats.compare(
    'srv_123',
    'snapshot_old',
    'snapshot_new',
    accessToken
)

if (comparison.data) {
    console.log('Comparing:')
    console.log(`  ${comparison.data.snapshot1.date} (${comparison.data.snapshot1.type})`)
    console.log(`  vs`)
    console.log(`  ${comparison.data.snapshot2.date} (${comparison.data.snapshot2.type})`)

    console.log('\nChanges:')
    console.log(
        `  Sessions: ${comparison.data.comparison.sessions_diff > 0 ? '+' : ''}${comparison.data.comparison.sessions_diff}`
    )
    console.log(
        `  Members: ${comparison.data.comparison.members_diff > 0 ? '+' : ''}${comparison.data.comparison.members_diff}`
    )
    console.log(
        `  Duration: ${comparison.data.comparison.duration_diff > 0 ? '+' : ''}${comparison.data.comparison.duration_diff}s`
    )
    console.log(
        `  Engagement: ${comparison.data.comparison.engagement_diff > 0 ? '+' : ''}${comparison.data.comparison.engagement_diff}`
    )

    console.log('\nTop MembersAside Changes:')
    console.log(`  New entries: ${comparison.data.top_members_changes.new_entries.length}`)
    console.log(`  Dropped: ${comparison.data.top_members_changes.dropped_entries.length}`)
    console.log(`  Maintained: ${comparison.data.top_members_changes.maintained}`)

    console.log('\nTop Activities Changes:')
    console.log(`  New entries: ${comparison.data.top_activities_changes.new_entries.length}`)
    console.log(`  Dropped: ${comparison.data.top_activities_changes.dropped_entries.length}`)
    console.log(`  Maintained: ${comparison.data.top_activities_changes.maintained}`)
}
```

#### 7. Cleanup Old Snapshots

```typescript
window.api.snapshotStats.cleanup(serverId, params, accessToken)
```

Delete snapshots older than specified days. Only the server creator can perform cleanup.

**Example:**

```typescript
// Cleanup snapshots older than 90 days
const cleanup = await window.api.snapshotStats.cleanup('srv_123', { days: 90 }, accessToken)

if (cleanup.data) {
    console.log(`Deleted ${cleanup.data.count} old snapshots`)
}
```

### Use Cases

#### Snapshot Dashboard

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const props = defineProps<{ serverId: string }>()

const summary = ref(null)
const loading = ref(false)

const loadSummary = async () => {
  loading.value = true
  const result = await window.api.snapshotStats.getSummary(
    props.serverId,
    session.value?.access_token
  )

  if (result.data) {
    summary.value = result.data
  }
  loading.value = false
}

onMounted(() => {
  loadSummary()
})
</script>

<template>
  <div class="snapshot-dashboard">
    <div v-if="summary?.daily" class="snapshot-card">
      <h3>Daily Snapshot</h3>
      <p>{{ summary.daily.snapshot_date }}</p>
      <p>Engagement: {{ summary.daily.data.server_stats.engagement_score }}</p>
    </div>

    <div v-if="summary?.weekly" class="snapshot-card">
      <h3>Weekly Snapshot</h3>
      <p>{{ summary.weekly.snapshot_date }}</p>
      <p>Sessions: {{ summary.weekly.data.server_stats.total_sessions }}</p>
    </div>

    <!-- More snapshot cards... -->
  </div>
</template>
```

#### Snapshot Comparison Chart

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/auth/useAuth'

const { session } = useAuth()
const props = defineProps<{
  serverId: string
  snapshotId1: string
  snapshotId2: string
}>()

const comparison = ref(null)

const chartData = computed(() => {
  if (!comparison.value) return null

  return {
    labels: ['Sessions', 'MembersAside', 'Duration (hrs)', 'Engagement'],
    differences: [
      comparison.value.comparison.sessions_diff,
      comparison.value.comparison.members_diff,
      comparison.value.comparison.duration_diff / 3600,
      comparison.value.comparison.engagement_diff
    ]
  }
})

const loadComparison = async () => {
  const result = await window.api.snapshotStats.compare(
    props.serverId,
    props.snapshotId1,
    props.snapshotId2,
    session.value?.access_token
  )

  if (result.data) {
    comparison.value = result.data
  }
}
</script>
```

### Architecture Benefits

## Next Steps

1. Create Vue composables for each stat type (optional):
    - `useServerStatsCRUD(serverId)`
    - `useMemberStatsCRUD(serverId, memberId)`
    - `useActivityStatsCRUD(serverId, activityId)`

2. Create reusable Vue components:
    - LeaderboardTable
    - StatsCard
    - TimelineChart
    - GrowthTrendGraph

3. Add caching layer for frequently accessed stats

4. Implement real-time updates using WebSocket events
