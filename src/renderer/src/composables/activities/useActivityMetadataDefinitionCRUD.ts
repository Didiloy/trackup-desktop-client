import { useUserStore } from '@/stores/user'
import type {
    IActivityMetadataDefinition,
    ICreateActivityMetadataDefinitionRequest,
    IUpdateActivityMetadataDefinitionRequest,
    IActivityMetadataDefinitionApiResponse
} from '@shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

interface UseActivityMetadataDefinitionCRUDReturn {
    createMetadataDefinition: (
        serverId: string,
        activityId: string,
        request: ICreateActivityMetadataDefinitionRequest
    ) => Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>>
    listMetadataDefinitions: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition[]>>
    getMetadataTypes: (
        serverId: string,
        activityId: string
    ) => Promise<IActivityMetadataDefinitionApiResponse<string[]>>
    getMetadataDefinitionById: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ) => Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>>
    updateMetadataDefinition: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        request: IUpdateActivityMetadataDefinitionRequest
    ) => Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>>
    deleteMetadataDefinition: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ) => Promise<IActivityMetadataDefinitionApiResponse<void>>
}

/**
 * Composable for Activity Metadata Definition entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useActivityMetadataDefinitionCRUD(): UseActivityMetadataDefinitionCRUDReturn {
    const user_store = useUserStore()

    /**
     * Create a new metadata definition for an activity
     */
    const createMetadataDefinition = async (
        serverId: string,
        activityId: string,
        request: ICreateActivityMetadataDefinitionRequest
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return window.api.activityMetadataDefinition.create(
            serverId,
            activityId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * List all metadata definitions for an activity
     */
    const listMetadataDefinitions = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition[]>> => {
        return window.api.activityMetadataDefinition.list(
            serverId,
            activityId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get available metadata types
     */
    const getMetadataTypes = async (
        serverId: string,
        activityId: string
    ): Promise<IActivityMetadataDefinitionApiResponse<string[]>> => {
        return window.api.activityMetadataDefinition.getTypes(
            serverId,
            activityId,
            user_store.getAccessToken!
        )
    }

    /**
     * Get metadata definition by ID
     */
    const getMetadataDefinitionById = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return window.api.activityMetadataDefinition.getById(
            serverId,
            activityId,
            metadataDefinitionId,
            user_store.getAccessToken!
        )
    }

    /**
     * Update a metadata definition
     */
    const updateMetadataDefinition = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        request: IUpdateActivityMetadataDefinitionRequest
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return window.api.activityMetadataDefinition.update(
            serverId,
            activityId,
            metadataDefinitionId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * Delete a metadata definition
     */
    const deleteMetadataDefinition = async (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string
    ): Promise<IActivityMetadataDefinitionApiResponse<void>> => {
        return window.api.activityMetadataDefinition.delete(
            serverId,
            activityId,
            metadataDefinitionId,
            user_store.getAccessToken!
        )
    }

    return {
        createMetadataDefinition,
        listMetadataDefinitions,
        getMetadataTypes,
        getMetadataDefinitionById,
        updateMetadataDefinition,
        deleteMetadataDefinition
    }
}
