import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IEnumDefinition,
    ICreateEnumDefinitionRequest,
    IUpdateEnumDefinitionRequest,
    IEnumDefinitionApiResponse
} from '../../../shared/contracts/interfaces/entities/enum-definition.interfaces'

/**
 * Enum Definition API Bridge
 * Exposes enum definition-related functions to the renderer
 */
export const enumDefinitionBridge = {
    /**
     * Create a new enum definition in a servers (creator only)
     */
    create: (
        serverId: string,
        request: ICreateEnumDefinitionRequest,
        accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinition.create,
            serverId,
            request,
            accessToken
        )
    },

    /**
     * List all enum enum-definitions in a servers
     */
    list: (
        serverId: string,
        accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition[]>> => {
        return ipcRenderer.invoke(ipc_channels.enumDefinition.list, serverId, accessToken)
    },

    /**
     * Get an enum definition by ID
     */
    getById: (
        serverId: string,
        enumDefinitionId: string,
        accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinition.getById,
            serverId,
            enumDefinitionId,
            accessToken
        )
    },

    /**
     * Update an enum definition (creator only)
     */
    update: (
        serverId: string,
        enumDefinitionId: string,
        request: IUpdateEnumDefinitionRequest,
        accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinition.update,
            serverId,
            enumDefinitionId,
            request,
            accessToken
        )
    },

    /**
     * Delete an enum definition (creator only)
     */
    delete: (
        serverId: string,
        enumDefinitionId: string,
        accessToken: string
    ): Promise<IEnumDefinitionApiResponse<void>> => {
        return ipcRenderer.invoke(
            ipc_channels.enumDefinition.delete,
            serverId,
            enumDefinitionId,
            accessToken
        )
    }
}

export type EnumDefinitionBridge = typeof enumDefinitionBridge
