/**
 * Member Activity Statistics Interfaces
 * All types related to member activity statistics and progression
 */

import { EPeriod } from '../../enums/period.enum'

// ============================================================================
// Member Activity Stats
// ============================================================================

export interface IMemberActivityStats {
    activity_id: string
    activity_name: string
    total_sessions: number
    total_duration: number
    avg_session_duration: number
    last_session_date: string
    skill_level: string
    proficiency_score: number
}

// ============================================================================
// Member Activity Details
// ============================================================================

export interface IMemberActivityDetails {
    server_member_id: string
    activity_id: string
    activity_name: string
    total_sessions: number
    total_duration: number
    avg_session_duration: number
    last_session_date: string
    skill_level: string
    proficiency_score: number
    sessions_created: number
    total_likes: number
}

// ============================================================================
// Member Activity Progression
// ============================================================================

export interface IMemberActivityProgression {
    period_type: string
    period_start: string
    period_end: string
    total_sessions: number
    total_duration: number
    avg_session_duration: number
    skill_level: string
    proficiency_score: number
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface IPaginatedMemberActivityStats {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IMemberActivityStats[]
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface IMemberActivityPaginationParams {
    page: number
    limit: number
}

export interface IMemberActivityProgressionParams {
    period?: EPeriod
    limit?: number
}

// ============================================================================
// API Response
// ============================================================================

export interface IMemberActivityStatsApiResponse<T = unknown> {
    data?: T
    error?: string
}
