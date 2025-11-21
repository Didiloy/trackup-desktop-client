/**
 * Activity related interfaces
 */
import { ISessionCreator } from './session.interfaces'

export interface IActivity {
    public_id: string
    name: string
    server_public_id: string
    description: string
    logo: string
    banner: string
}

export interface ICreateActivityRequest {
    name: string
    description: string
    logo: string
    banner: string
}

export interface ICreateActivitySessionRequest {
    duration: number
    date: string
    participants: string[]
    comment?: string
    title?: string
}

export interface IUpdateActivityRequest {
    name: string
    description: string
    logo: string
    banner: string
}

export interface IListActivitiesOptions {
    page?: number
    limit?: number
    search?: string
    searchMode?: 'startsWith' | 'endsWith' | 'contains' | 'exact'
}

export interface IPaginatedActivities {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IActivity[]
}

export interface IActivitySessionListItem {
    public_id: string
    date: string
    duration: string
    likes_count: number
    liked_by_me: boolean
    participants_count: number
    title?: string
    creator: ISessionCreator
}

export interface IPaginatedActivitySessions {
    total: number
    page: number
    limit: number
    pageCount: number
    data: IActivitySessionListItem[]
}

export interface IActivityApiResponse<T = unknown> {
    data?: T
    error?: string
}
