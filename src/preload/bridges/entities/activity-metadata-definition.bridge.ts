import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IActivityMetadataDefinition,
    ICreateActivityMetadataDefinitionRequest,
    IUpdateActivityMetadataDefinitionRequest,
    IActivityMetadataDefinitionApiResponse
} from '../../../shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'

/**
 * Activity Metadata Definition API Bridge
 * Exposes activity metadata definition-related functions to the renderer
 */
export const activityMetadataDefinitionBridge = {
    /**
     * Create a new metadata definition for an activity
     */
    create: (
        serverId: string,
        activityId: string,
        request: ICreateActivityMetadataDefinitionRequest,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.create,
            serverId,
            activityId,
            request,
            accessToken
        )
    },

    /**
     * List all metadata definitions for an activity
     */
    list: (
        serverId: string,
        activityId: string,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition[]>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.list,
            serverId,
            activityId,
            accessToken
        )
    },

    /**
     * Get available metadata types
     */
    getTypes: (
        serverId: string,
        activityId: string,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<string[]>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.getTypes,
            serverId,
            activityId,
            accessToken
        )
    },

    /**
     * Get details of a specific metadata definition
     */
    getById: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.getById,
            serverId,
            activityId,
            metadataDefinitionId,
            accessToken
        )
    },

    /**
     * Update a metadata definition
     */
    update: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        request: IUpdateActivityMetadataDefinitionRequest,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.update,
            serverId,
            activityId,
            metadataDefinitionId,
            request,
            accessToken
        )
    },

    /**
     * Delete a metadata definition
     */
    delete: (
        serverId: string,
        activityId: string,
        metadataDefinitionId: string,
        accessToken: string
    ): Promise<IActivityMetadataDefinitionApiResponse<void>> => {
        return ipcRenderer.invoke(
            ipc_channels.activityMetadataDefinition.delete,
            serverId,
            activityId,
            metadataDefinitionId,
            accessToken
        )
    }
}

export type ActivityMetadataDefinitionBridge = typeof activityMetadataDefinitionBridge
