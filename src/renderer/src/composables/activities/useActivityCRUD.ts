import { useUserStore } from '@/stores/user'
import type {
    IActivity,
    ICreateActivityRequest,
    IUpdateActivityRequest,
    IListActivitiesOptions,
    IActivityApiResponse,
    IPaginatedActivities
} from '@shared/contracts/interfaces/entities/activity.interfaces'

interface UseActivityCRUDReturn {
    createActivity: (
        serverId: string,
        request: ICreateActivityRequest
    ) => Promise<IActivityApiResponse<IActivity>>
    listActivities: (
        serverId: string,
        options?: IListActivitiesOptions
    ) => Promise<IActivityApiResponse<IPaginatedActivities>>
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
        return await window.api.activity.create(serverId, JSON.parse(JSON.stringify(request)), user_store.getAccessToken!) //The JSON methods are used to ensure the request is a valid object because otherwise it does not pass                          
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
        listActivities,
        getActivityById,
        updateActivity,
        deleteActivity
    }
}
