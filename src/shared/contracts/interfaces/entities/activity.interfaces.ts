/**
 * Activity related interfaces
 */

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

export interface IActivityApiResponse<T = unknown> {
    data?: T
    error?: string
}
