import { useUserStore } from '@/stores/user'
import type {
    IActivity,
    ICreateActivityRequest,
    IUpdateActivityRequest,
    IListActivitiesOptions,
    IActivityApiResponse,
    IPaginatedActivities,
    ICreateActivitySessionRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'
import type {
    ISession,
    ISessionApiResponse
} from '@shared/contracts/interfaces/entities/session.interfaces'

interface UseActivityCRUDReturn {
    createActivity: (
        serverId: string,
        request: ICreateActivityRequest
    ) => Promise<IActivityApiResponse<IActivity>>
    createActivitySession: (
        serverId: string,
        activityId: string,
        request: ICreateActivitySessionRequest
    ) => Promise<ISessionApiResponse<ISession>>
    listActivities: (
        serverId: string,
        options?: IListActivitiesOptions
    ) => Promise<IActivityApiResponse<IPaginatedActivities>>
    listActivitySessions: (
        serverId: string,
        activityId: string,
        options?: IListActivitiesOptions
    ) => Promise<ISessionApiResponse<IPaginatedActivities>>
    getActivityById: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityApiResponse<IActivity>>
    updateActivity: (
        serverId: string,
        activityId: string,
        request: IUpdateActivityRequest
    ) => Promise<IActivityApiResponse<IActivity>>
    deleteActivity: (serverId: string, activityId: string) => Promise<IActivityApiResponse<void>>
}

/**
 * Composable for Activity entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useActivityCRUD(): UseActivityCRUDReturn {
    const user_store = useUserStore()

    /**
     * Create a new activity in a servers
     */
    const createActivity = async (
        serverId: string,
        request: ICreateActivityRequest
    ): Promise<IActivityApiResponse<IActivity>> => {
        return await window.api.activity.create(serverId, request, user_store.getAccessToken!) //The JSON methods are used to ensure the request is a valid object because otherwise it does not pass
    }

    /**
     * Create a new session for a specific activity
     */
    const createActivitySession = async (
        serverId: string,
        activityId: string,
        request: ICreateActivitySessionRequest
    ): Promise<ISessionApiResponse<ISession>> => {
        return window.api.activity.createSession(
            serverId,
            activityId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * List all activities in a servers with optional search
     */
    const listActivities = async (
        serverId: string,
        options?: IListActivitiesOptions
    ): Promise<IActivityApiResponse<IPaginatedActivities>> => {
        const response = (await window.api.activity.list(
            serverId,
            options,
            user_store.getAccessToken!
        )) as IActivityApiResponse<IPaginatedActivities | IActivity[]>
        if (Array.isArray(response.data)) {
            const arr = response.data
            return {
                data: {
                    total: arr.length,
                    page: 1,
                    limit: arr.length,
                    pageCount: 1,
                    data: arr
                }
            }
        }
        return response as IActivityApiResponse<IPaginatedActivities>
    }

    /**
     * List all sessions for a specific activity with optional search
     */
    const listActivitySessions = async (
        serverId: string,
        activityId: string,
        options?: IListActivitiesOptions
    ): Promise<ISessionApiResponse<IPaginatedActivities>> => {
        const response = (await window.api.activity.listSessions(
            serverId,
            activityId,
            options,
            user_store.getAccessToken!
        )) as ISessionApiResponse<IPaginatedActivities | IActivity[]>
        if (Array.isArray(response.data)) {
            const arr = response.data
            return {
                data: {
                    total: arr.length,
                    page: 1,
                    limit: arr.length,
                    pageCount: 1,
                    data: arr
                }
            }
        }
        return response as ISessionApiResponse<IPaginatedActivities>
    }

    /**
     * Get details of a specific activity
     */
    const getActivityById = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityApiResponse<IActivity>> => {
        return window.api.activity.getById(serverId, activityId, user_store.getAccessToken!)
    }

    /**
     * Update an activity (creator only)
     */
    const updateActivity = async (
        serverId: string,
        activityId: string,
        request: IUpdateActivityRequest
    ): Promise<IActivityApiResponse<IActivity>> => {
        return window.api.activity.update(serverId, activityId, request, user_store.getAccessToken!)
    }

    /**
     * Delete an activity (creator only)
     */
    const deleteActivity = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityApiResponse<void>> => {
        return window.api.activity.delete(serverId, activityId, user_store.getAccessToken!)
    }

    return {
        createActivity,
        createActivitySession,
        listActivities,
        listActivitySessions,
        getActivityById,
        updateActivity,
        deleteActivity
    }
}
