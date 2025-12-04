/**
 * Activity Metadata Definition Statistics Interfaces
 * All types related to activity metadata definition statistics and analytics
 */

import type { EPeriod } from '../../enums/period.enum'
import type { ActivityMetadataType } from '../entities/activity-metadata-definition.interfaces'

// ============================================================================
// Base Types
// ============================================================================

export type MetadataDefinitionType = ActivityMetadataType

// ============================================================================
// Summary DTO
// ============================================================================

export interface IMetadataDefinitionSummaryDto {
    metadata_definition_id: string
    metadata_definition_name: string
    metadata_key: string
    metadata_type: MetadataDefinitionType
    total_usage: number
    unique_values?: number
    most_common_value?: string | number | boolean
    numeric_summary?: INumericSummary
}

export interface INumericSummary {
    sum: number
    avg: number
    min: number
    max: number
}

// ============================================================================
// Detail DTO
// ============================================================================

export interface IMetadataDefinitionDetailDto {
    metadata_definition_id: string
    metadata_definition_name: string
    metadata_key: string
    metadata_type: MetadataDefinitionType
    period_type: EPeriod
    period_start?: string
    period_end?: string
    count?: number
    sum?: number
    avg?: number
    min?: number
    max?: number
    value?: string
    usage_count?: number
    percentage?: number
}

// ============================================================================
// Distribution DTO
// ============================================================================

export interface IMetadataDistributionDto {
    metadata_definition_id: string
    metadata_definition_name: string
    metadata_key: string
    metadata_type: MetadataDefinitionType
    values: IMetadataValueItemDto[]
}

export interface IMetadataValueItemDto {
    value: string
    count: number
    percentage: number
    total_sessions: number
}

// ============================================================================
// Timeline DTO
// ============================================================================

export interface IMetadataTimelineDto {
    period_start: string
    period_end: string
    count: number
    sum?: number
    avg?: number
    min?: number
    max?: number
    distribution?: IDistributionItemDto[]
}

export interface IDistributionItemDto {
    value: string
    count: number
}

// ============================================================================
// Paginated Responses
// ============================================================================

export interface IPaginatedResponseOfMetadataDefinitionSummaryDto {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IMetadataDefinitionSummaryDto[]
}

export interface IPaginatedResponseOfMetadataDefinitionDetailDto {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IMetadataDefinitionDetailDto[]
}

// ============================================================================
// Parameters
// ============================================================================

export interface IMetadataDefinitionStatsParams {
    page: number
    limit: number
    period?: EPeriod
}

export interface IMetadataDefinitionTimelineParams {
    limit?: number
    period?: EPeriod
}

// ============================================================================
// API Response Type
// ============================================================================

export type IActivityMetadataDefinitionStatsApiResponse<T> = {
    data?: T
    error?: string
}
