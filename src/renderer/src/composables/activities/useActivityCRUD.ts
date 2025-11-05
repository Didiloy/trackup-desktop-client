import { useUserStore } from '@/stores/user'
import type {
  IActivity,
  ICreateActivityRequest,
  IUpdateActivityRequest,
  IListActivitiesOptions,
  IActivityApiResponse
} from '../../../../shared/contracts/interfaces/entities/activity.interfaces'

interface UseActivityCRUDReturn {
  createActivity: (
    serverId: string,
    request: ICreateActivityRequest
  ) => Promise<IActivityApiResponse<IActivity>>
  listActivities: (
    serverId: string,
    options?: IListActivitiesOptions
  ) => Promise<IActivityApiResponse<IActivity[]>>
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
    return window.api.activity.create(serverId, request, user_store.getAccessToken!)
  }

  /**
   * List all activities in a servers with optional search
   */
  const listActivities = async (
    serverId: string,
    options?: IListActivitiesOptions
  ): Promise<IActivityApiResponse<IActivity[]>> => {
    return window.api.activity.list(serverId, options, user_store.getAccessToken!)
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
