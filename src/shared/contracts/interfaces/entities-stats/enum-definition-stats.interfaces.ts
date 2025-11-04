/**
 * Enum Definition Statistics Interfaces
 * All types related to enum definition statistics and value distribution
 */

import { EPeriod } from '../../enums/period.enum'

// ============================================================================
// Enum Definition Stats
// ============================================================================

export interface IMostUsedValue {
  enum_value_id: string
  usage_count: number
}

export interface IEnumDefinitionStats {
  enum_definition_id: string
  enum_definition_name: string
  total_values: number
  total_usage: number
  total_sessions: number
  total_duration: number
  unique_users: number
  most_used_value: IMostUsedValue
}

// ============================================================================
// Enum Value Stats (Detailed)
// ============================================================================

export interface IEnumValueStats {
  period_type: string
  period_start: string
  period_end: string
  enum_definition_id: string
  enum_definition_name: string
  enum_value_id: string
  enum_value_display: string
  enum_value_key: string
  selected_key: string
  usage_count: number
  total_sessions: number
  total_duration: number
  unique_users: number
  percentage_of_total: number
  avg_likes_when_selected: number
  avg_participants_when_selected: number
}

// ============================================================================
// Enum Value Distribution
// ============================================================================

export interface IEnumValueDistribution {
  enum_value_id: string
  enum_value_display: string
  enum_value_key: string
  selected_key: string
  usage_count: number
  percentage: number
  total_sessions: number
  total_duration: number
  unique_users: number
  avg_likes_when_selected: number
}

// ============================================================================
// Paginated Responses
// ============================================================================

export interface IPaginatedEnumDefinitionStats {
  total: number
  page: number
  limit: number
  pageCount: number
  data: IEnumDefinitionStats[]
}

export interface IPaginatedEnumValueStats {
  total: number
  page: number
  limit: number
  pageCount: number
  data: IEnumValueStats[]
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface IEnumDefinitionPaginationParams {
  page: number
  limit: number
}

export interface IEnumDefinitionDetailsParams {
  page: number
  limit: number
  period?: EPeriod
}

export interface IEnumValueDetailsParams {
  page: number
  limit: number
  period?: EPeriod
}

// ============================================================================
// API Response
// ============================================================================

export interface IEnumDefinitionStatsApiResponse<T = unknown> {
  data?: T
  error?: string
}
