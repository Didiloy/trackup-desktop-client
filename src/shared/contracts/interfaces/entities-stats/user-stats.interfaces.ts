/**
 * User stats related interfaces
 */

export interface IUserStats {
    total_servers_joined: number
    total_servers_created: number
    total_sessions: number
    total_duration: number // in minutes
    avg_session_duration: number // in minutes
    total_unique_activities_played: number
    most_active_server_name: string
    average_session_participants: number
    total_likes_given: number
    total_likes_received: number
    total_app_time: number // in minutes
    last_active_at?: string
}

export interface ILastSession {
    id: string
    activity_name: string
    server_name: string
    date: string
    duration: number
}

export interface IUserProfile {
    user_id: string
    email: string
    stats: IUserStats
    last_sessions: ILastSession[]
}

export interface IAppSessionResponse {
    session_id: string
    started_at: string
}
