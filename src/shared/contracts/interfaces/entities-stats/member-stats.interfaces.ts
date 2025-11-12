/**
 * Member Statistics Interfaces
 * All types related to member statistics and analytics
 */

import type { IStatsTimeline, IGrowthMetric } from './server-stats.interfaces'
import { EPeriod } from '../../enums/period.enum'

// ============================================================================
// Base Member Stats
// ============================================================================

export interface IFavoriteActivity {
    id: string
    name: string
    sessions_count: number
}

export interface IMemberStats {
    member_id: string
    user_email: string
    total_sessions: number
    total_duration: number
    sessions_created: number
    sessions_participated: number
    likes_given: number
    likes_received: number
    favorite_activity: IFavoriteActivity
}

// ============================================================================
// Activity Patterns
// ============================================================================

export interface IMemberActivityPatterns {
    most_active_day_of_week: number
    most_active_hour: number
    streak_current: number
    streak_longest: number
}

// ============================================================================
// Ranking
// ============================================================================

export interface IMemberRanking {
    rank_in_server: number
    percentile: number
    total_duration: number
    total_sessions: number
    total_members: number
}

// ============================================================================
// Growth Trends
// ============================================================================

export interface IMemberGrowthTrends {
    member_id: string
    period: string
    current_period_start: string
    current_period_end: string
    sessions: IGrowthMetric
    duration: IGrowthMetric
}

// ============================================================================
// Member Details (Combined)
// ============================================================================

export interface IMemberStatsDetails extends IMemberStats {
    patterns: IMemberActivityPatterns
    ranking: IMemberRanking
    timeline: IStatsTimeline[]
}

// ============================================================================
// Leaderboard
// ============================================================================

export interface ILeaderboardEntry {
    rank: number
    member_id: string
    member_name: string
    total_duration: number
    total_sessions: number
    percentile: number
}

export interface IMemberLeaderboard {
    leaderboard: ILeaderboardEntry[]
    period: string
    limit: number
    total_members: number
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface IPaginatedMemberStats {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IMemberStats[]
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface ILeaderboardParams {
    period?: EPeriod
    limit?: number
}

export interface IPaginationParams {
    page: number
    limit: number
}

export interface IMemberTimelineParams {
    period?: EPeriod
    limit?: number
}

export interface IMemberGrowthParams {
    period?: EPeriod
}

// ============================================================================
// API Response
// ============================================================================

export interface IMemberStatsApiResponse<T = unknown> {
    data?: T
    error?: string
}
