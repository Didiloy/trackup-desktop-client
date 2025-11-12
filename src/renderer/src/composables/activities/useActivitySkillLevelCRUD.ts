import { useUserStore } from '@/stores/user'
import type {
    IActivitySkillLevel,
    ICreateActivitySkillLevelRequest,
    IUpdateActivitySkillLevelRequest,
    IActivitySkillLevelApiResponse
} from '../../../../shared/contracts/interfaces/entities/activity-skill-level.interfaces'

interface UseActivitySkillLevelCRUDReturn {
    createSkillLevel: (
        serverId: string,
        activityId: string,
        request: ICreateActivitySkillLevelRequest
    ) => Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>>
    listSkillLevels: (
        serverId: string,
        activityId: string
    ) => Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel[]>>
    getSkillLevelById: (
        serverId: string,
        activityId: string,
        skillLevelId: string
    ) => Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>>
    updateSkillLevel: (
        serverId: string,
        activityId: string,
        skillLevelId: string,
        request: IUpdateActivitySkillLevelRequest
    ) => Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>>
    deleteSkillLevel: (
        serverId: string,
        activityId: string,
        skillLevelId: string
    ) => Promise<IActivitySkillLevelApiResponse<void>>
}

/**
 * Composable for Activity Skill Level entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useActivitySkillLevelCRUD(): UseActivitySkillLevelCRUDReturn {
    const user_store = useUserStore()

    /**
     * Create a new skill level for an activity
     */
    const createSkillLevel = async (
        serverId: string,
        activityId: string,
        request: ICreateActivitySkillLevelRequest
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
        return window.api.activitySkillLevel.create(
            serverId,
            activityId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * List all skill levels for an activity
     */
    const listSkillLevels = async (
        serverId: string,
        activityId: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel[]>> => {
        return window.api.activitySkillLevel.list(serverId, activityId, user_store.getAccessToken!)
    }

    /**
     * Get skill level by ID
     */
    const getSkillLevelById = async (
        serverId: string,
        activityId: string,
        skillLevelId: string
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
        return window.api.activitySkillLevel.getById(
            serverId,
            activityId,
            skillLevelId,
            user_store.getAccessToken!
        )
    }

    /**
     * Update a skill level
     */
    const updateSkillLevel = async (
        serverId: string,
        activityId: string,
        skillLevelId: string,
        request: IUpdateActivitySkillLevelRequest
    ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
        return window.api.activitySkillLevel.update(
            serverId,
            activityId,
            skillLevelId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * Delete a skill level
     */
    const deleteSkillLevel = async (
        serverId: string,
        activityId: string,
        skillLevelId: string
    ): Promise<IActivitySkillLevelApiResponse<void>> => {
        return window.api.activitySkillLevel.delete(
            serverId,
            activityId,
            skillLevelId,
            user_store.getAccessToken!
        )
    }

    return {
        createSkillLevel,
        listSkillLevels,
        getSkillLevelById,
        updateSkillLevel,
        deleteSkillLevel
    }
}
