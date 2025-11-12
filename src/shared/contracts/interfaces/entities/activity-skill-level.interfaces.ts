/**
 * Activity Skill Level related interfaces
 */

export interface IActivitySkillLevel {
    public_id: string
    name: string
    display_order: number
    min_sessions: number
    max_sessions: number | null
    min_duration: number
    max_duration: number | null
    description: string | null
    color: string | null
    created_at: string
    updated_at: string
}

export interface ICreateActivitySkillLevelRequest {
    name: string
    display_order: number
    min_sessions: number
    max_sessions?: number | null
    min_duration: number
    max_duration?: number | null
    description?: string
    color?: string
}

export interface IUpdateActivitySkillLevelRequest {
    name?: string
    display_order?: number
    min_sessions?: number
    max_sessions?: number | null
    min_duration?: number
    max_duration?: number | null
    description?: string
    color?: string
}

export interface IActivitySkillLevelApiResponse<T = unknown> {
    data?: T
    error?: string
}
