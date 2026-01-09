/**
 * Snapshot Statistics Interfaces
 * All types related to servers statistics snapshots
 */

// ============================================================================
// Snapshot Types
// ============================================================================

export type SnapshotType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'milestone' | 'custom'

// ============================================================================
// Period Stats (Server Stats)
// ============================================================================

export interface IPeriodStats {
    period_type?: string
    period_start?: string
    period_end?: string
    total_sessions?: number
    total_duration?: number
    total_members?: number
    active_members?: number
    new_members?: number
    total_activities?: number
    active_activities?: number
    total_likes?: number
    avg_likes_per_session?: number
    avg_participants_per_session?: number
    sessions_growth_rate?: number
    members_growth_rate?: number
    engagement_score?: number
}

// ============================================================================
// Top Items
// ============================================================================

export interface ISnapshotTopMember {
    member_id: string
    public_id: string
    email: string
    total_duration: number
    total_sessions: number
    rank?: number | null
}

export interface ISnapshotTopActivity {
    activity_id: string
    public_id: string
    name: string
    total_sessions: number
    total_duration: number
    popularity_score?: number
    rank?: number | null
    peak_hour?: number | null
    peak_day_of_week?: number | null
}

export interface ISnapshotTopEnum {
    enum_definition?: string
    enum_definition_public_id?: string
    enum_value_public_id?: string
    selected_key?: string
    label?: string
    usage_count?: number
    total_sessions?: number
    percentage_of_total?: number
}

// ============================================================================
// Trends & Metadata
// ============================================================================

export interface ISnapshotTrends {
    sessions_change?: number
    members_change?: number
    duration_change?: number
    engagement_change?: number
}

export interface ISnapshotMetadata {
    generated_at: string
    period_covered: string
    period_start?: string
    period_end?: string
}

// ============================================================================
// Snapshot Data (Full)
// ============================================================================

export interface ISnapshotData {
    server_stats?: IPeriodStats
    period_stats?: IPeriodStats
    top_members: ISnapshotTopMember[]
    top_activities: ISnapshotTopActivity[]
    top_enums?: ISnapshotTopEnum[]
    top_members_period?: ISnapshotTopMember[]
    top_activities_period?: ISnapshotTopActivity[]
    trends?: ISnapshotTrends
    metadata?: ISnapshotMetadata
}

// ============================================================================
// Snapshot (Full)
// ============================================================================

export interface ISnapshot {
    id: string
    server_id: string
    snapshot_date: string
    snapshot_type: SnapshotType
    title?: string
    description?: string
    created_at: string
    data: ISnapshotData
}

// ============================================================================
// Snapshot Highlights (Light)
// ============================================================================

export interface ISnapshotHighlights {
    total_sessions?: number
    total_duration?: number
    total_members?: number
    engagement_score?: number
    sessions_change?: number
    members_change?: number
    duration_change?: number
    engagement_change?: number
}

export interface ISnapshotLight {
    id: string
    server_id: string
    snapshot_date: string
    snapshot_type: SnapshotType
    title?: string
    description?: string
    created_at: string
    highlights?: ISnapshotHighlights
}

// ============================================================================
// Snapshot Comparison
// ============================================================================

export interface ISnapshotReference {
    id: string
    snapshot_date: string
    snapshot_type: SnapshotType
    title?: string
}

export interface ISnapshotComparison {
    sessions_diff: number
    members_diff: number
    duration_diff: number
    engagement_diff: number
}

export interface ITopItemsChanges {
    new_entries: unknown[]
    dropped_entries: unknown[]
    maintained: number
}

export interface ISnapshotComparisonResult {
    snapshot1: ISnapshotReference
    snapshot2: ISnapshotReference
    comparison: ISnapshotComparison
    top_members_changes: ITopItemsChanges
    top_activities_changes: ITopItemsChanges
}

// ============================================================================
// Snapshot Summary
// ============================================================================

export interface ISnapshotSummary {
    daily?: ISnapshot
    weekly?: ISnapshot
    monthly?: ISnapshot
    yearly?: ISnapshot
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface IPaginatedSnapshots {
    total: number
    page: number
    limit: number
    pageCount: number
    data: ISnapshotLight[]
}

// ============================================================================
// Request Types
// ============================================================================

export interface ICreateSnapshotRequest {
    type: SnapshotType
    title?: string
    description?: string
}

export interface IGetSnapshotsParams {
    page: number
    type?: SnapshotType
    limit?: number
    from_date?: string
    to_date?: string
}

export interface IGetLatestSnapshotParams {
    type: SnapshotType
}

export interface ICleanupSnapshotsParams {
    days?: number
    include_types?: SnapshotType[]
}

export interface ICleanupSnapshotsResponse {
    count: number
}

// ============================================================================
// API Response
// ============================================================================

export interface ISnapshotApiResponse<T = unknown> {
    data?: T
    error?: string
}
