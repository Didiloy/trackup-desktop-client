import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IActivityMetadataDefinition,
    ICreateActivityMetadataDefinitionRequest,
    IUpdateActivityMetadataDefinitionRequest,
    IActivityMetadataDefinitionApiResponse
} from '../../../shared/contracts/interfaces/entities/activity-metadata-definition.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    combineValidations
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:ActivityMetadataDefinition')

/**
 * Register activity metadata definition-related IPC handlers
 */
export function registerActivityMetadataDefinitionIpc(): void {
    // Create a new metadata definition for an activity
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.create,
        async (
            _event,
            serverId: string,
            activityId: string,
            request: ICreateActivityMetadataDefinitionRequest,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
            logger.info('Creating metadata definition for activity:', activityId)

            // Validate input
            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(request.key, 'Metadata key'),
                validateRequired(request.type, 'Metadata type'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<IActivityMetadataDefinition>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions`,
                accessToken,
                request
            )
        }
    )

    // List all metadata enum-definitions for an activity
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.list,
        async (
            _event,
            serverId: string,
            activityId: string,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition[]>> => {
            logger.info('Listing metadata enum-definitions for activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IActivityMetadataDefinition[]>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions`,
                accessToken
            )
        }
    )

    // Get available metadata types
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.getTypes,
        async (
            _event,
            serverId: string,
            activityId: string,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<string[]>> => {
            logger.info('Getting metadata types for activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<string[]>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions/types`,
                accessToken
            )
        }
    )

    // Get metadata definition by ID
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.getById,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
            logger.info('Getting metadata definition details:', metadataDefinitionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata definition ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IActivityMetadataDefinition>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions/${metadataDefinitionId}`,
                accessToken
            )
        }
    )

    // Update a metadata definition
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.update,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            request: IUpdateActivityMetadataDefinitionRequest,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<IActivityMetadataDefinition>> => {
            logger.info('Updating metadata definition:', metadataDefinitionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata definition ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.put<IActivityMetadataDefinition>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions/${metadataDefinitionId}`,
                accessToken,
                request
            )
        }
    )

    // Delete a metadata definition
    ipcMain.handle(
        ipc_channels.activityMetadataDefinition.delete,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionApiResponse<void>> => {
            logger.info('Deleting metadata definition:', metadataDefinitionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata definition ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(
                `/api/v1/servers/${serverId}/activities/${activityId}/metadata-definitions/${metadataDefinitionId}`,
                accessToken
            )
        }
    )

    logger.info('Activity metadata definition IPC handlers registered')
}
