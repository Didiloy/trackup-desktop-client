/**
 * Activity related interfaces
 */

export interface IActivity {
    public_id: string
    name: string
    server_public_id: string
}

export interface ICreateActivityRequest {
    name: string
}

export interface IUpdateActivityRequest {
    name: string
}

export interface IListActivitiesOptions {
    search?: string
    searchMode?: 'startsWith' | 'endsWith' | 'contains' | 'exact'
}

export interface IActivityApiResponse<T = unknown> {
    data?: T
    error?: string
}
