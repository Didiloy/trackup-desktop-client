/**
 * Server Statistics Interfaces
 * All types related to servers statistics and analytics
 */
import { EPeriod } from '../../enums/period.enum'

// ============================================================================
// Base Server Stats
// ============================================================================

export interface IServerStats {
    server_id: string
    server_name: string
    total_sessions: number
    total_duration: number
    avg_session_duration: number
    total_members: number
    active_members: number
    total_activities: number
    total_likes: number
    avg_likes_per_session: number
    avg_participants_per_session: number
    engagement_score: number
}

// ============================================================================
// Timeline & Trends
// ============================================================================

export interface IStatsTimeline {
    period: string
    sessions_count: number
    total_duration: number
    avg_duration: number
    total_likes?: number
    unique_members: number
}

export interface IGrowthMetric {
    current_value: number
    previous_value: number
    change: number
    change_percent: number
}

export interface IServerGrowthTrends {
    period: string
    current_period_start: string
    current_period_end: string
    sessions: IGrowthMetric
    duration: IGrowthMetric
    members: IGrowthMetric
}

export interface IServerGrowthResponse {
    current_period: IGrowthMetric
    previous_period: IGrowthMetric
    growth_rates: IGrowthMetric
    period_info?: Record<string, unknown>
}

// ============================================================================
// Comparative Analysis
// ============================================================================

export interface IComparativeChange {
    sessions_percent: number
    duration_percent: number
}

export interface IComparativePeriod {
    period: string
    sessions_count: number
    total_duration: number
    avg_duration: number
    total_likes: number
    unique_members: number
}

export interface IComparativeAnalysis {
    period: string
    current: IComparativePeriod
    previous: IComparativePeriod
    change: IComparativeChange
}

// ============================================================================
// Server Details (Combined)
// ============================================================================

export interface ITopMember {
    rank: number
    member_id: string
    user_email?: string
    total_sessions?: number
    total_duration?: number
}

export interface ITopActivity {
    activity_id: string
    activity_name: string
    total_sessions: number
    total_duration: number
    avg_duration: number
    total_likes: number
    avg_likes_per_session: number
    unique_participants: number
    total_participants: number
    avg_participants_per_session: number
    popularity_score?: number
}

export interface IServerStatsDetails {
    server_stats: IServerStats
    top_members: ITopMember[]
    top_activities: ITopActivity[]
    timeline: IStatsTimeline[]
    growth_trends?: IServerGrowthResponse
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface IStatsTimelineParams {
    period?: EPeriod
    limit?: number
    isoWeek?: boolean
}

export interface IStatsGrowthParams {
    period?: EPeriod
}

// ============================================================================
// API Response
// ============================================================================

export interface IServerStatsApiResponse<T = unknown> {
    data?: T
    error?: string
}
