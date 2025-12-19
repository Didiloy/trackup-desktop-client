/**
 * Activity Statistics Interfaces
 * All types related to activity statistics and analytics
 */

import type { IStatsTimeline, IGrowthMetric } from './server-stats.interfaces'
import { EPeriod } from '../../enums/period.enum'

// ============================================================================
// Base Activity Stats
// ============================================================================

export interface IActivityStats {
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

// ============================================================================
// Time Patterns
// ============================================================================

export interface IActivityTimePatterns {
    peak_day_of_week: number | null
    peak_hour: number | null
    avg_session_hours?: number
    likes_per_session?: number
    unique_participants?: number
    streak_current?: number
    streak_longest?: number
}

// ============================================================================
// Growth Trends
// ============================================================================

export interface IActivityGrowthTrend {
    growth_percent: number
    sessions_this_week: number
    sessions_last_week: number
    growth_rate: number
    trend: string
}

export interface IActivityGrowthTrends {
    activity_id: string
    activity_name: string
    period: string
    current_period_start: string
    current_period_end: string
    sessions: IGrowthMetric
    duration: IGrowthMetric
    unique_members: IGrowthMetric
}

// ============================================================================
// Top Contributors
// ============================================================================

export interface ITopContributor {
    rank: number
    member_id: string
    user_email: string | null
    sessions_count: number
    total_duration: number
}

// ============================================================================
// Activity Details (Combined)
// ============================================================================

export interface IActivityStatsDetails extends IActivityStats {
    time_patterns: IActivityTimePatterns
    growth_trend: IActivityGrowthTrend
    timeline: IStatsTimeline[]
    top_contributors?: ITopContributor[]
}

// ============================================================================
// Leaderboard
// ============================================================================

export interface IActivityLeaderboardEntry {
    rank: number
    activity_id: string
    activity_name: string
    popularity_score: number
    total_sessions: number
    total_duration: number
    unique_members: number
}

export interface IActivityLeaderboard {
    leaderboard: IActivityLeaderboardEntry[]
    period: string
    limit: number
    total_activities: number
}

// ============================================================================
// Ranking
// ============================================================================

export interface IActivityRanking {
    activity_id: string
    name: string
    rank: number
    total_sessions: number
    total_duration: number
    popularity_score: number
    total_activities: number
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface IPaginatedActivityStats {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IActivityStats[]
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface IActivityLeaderboardParams {
    period?: EPeriod
    limit?: number
}

export interface IActivityPaginationParams {
    page: number
    limit: number
}

export interface IActivityTimelineParams {
    period?: EPeriod
    limit?: number
}

export interface IActivityGrowthParams {
    period?: EPeriod
}

export interface IActivityRankingParams {
    period?: EPeriod
}

// ============================================================================
// API Response
// ============================================================================

export interface IActivityStatsApiResponse<T = unknown> {
    data?: T
    error?: string
}
