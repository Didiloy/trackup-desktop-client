/**
 * Activity Metadata Definition Statistics IPC Handlers
 * Handles all activity metadata definition statistics-related IPC communication
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IPaginatedResponseOfMetadataDefinitionSummaryDto,
    IPaginatedResponseOfMetadataDefinitionDetailDto,
    IMetadataDistributionDto,
    IMetadataTimelineDto,
    IMetadataDefinitionStatsParams,
    IMetadataDefinitionTimelineParams,
    IActivityMetadataDefinitionStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/activity-metadata-definition-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    validatePagination,
    combineValidations,
    buildQueryParams
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:ActivityMetadataDefinitionStats')

export function registerActivityMetadataDefinitionStatsIpc(): void {
    // Get all metadata definitions statistics
    ipcMain.handle(
        ipc_channels.activityMetadataDefinitionStats.getAll,
        async (
            _event,
            serverId: string,
            activityId: string,
            params: IMetadataDefinitionStatsParams,
            accessToken: string
        ): Promise<
            IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionSummaryDto>
        > => {
            logger.info('Getting all metadata definitions stats:', serverId, activityId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validatePagination(params.page, params.limit),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IPaginatedResponseOfMetadataDefinitionSummaryDto>(
                `/api/v1/stats/servers/${serverId}/activities/${activityId}/metadata_definitions${queryString}`,
                accessToken
            )
        }
    )

    // Get metadata definition statistics
    ipcMain.handle(
        ipc_channels.activityMetadataDefinitionStats.getById,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            params: IMetadataDefinitionStatsParams,
            accessToken: string
        ): Promise<
            IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
        > => {
            logger.info(
                'Getting metadata definition stats:',
                serverId,
                activityId,
                metadataDefinitionId,
                params
            )

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata Definition ID'),
                validatePagination(params.page, params.limit),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IPaginatedResponseOfMetadataDefinitionDetailDto>(
                `/api/v1/stats/servers/${serverId}/activities/${activityId}/metadata_definitions/${metadataDefinitionId}${queryString}`,
                accessToken
            )
        }
    )

    // Get metadata value distribution
    ipcMain.handle(
        ipc_channels.activityMetadataDefinitionStats.getDistribution,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataDistributionDto>> => {
            logger.info(
                'Getting metadata value distribution:',
                serverId,
                activityId,
                metadataDefinitionId
            )

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata Definition ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IMetadataDistributionDto>(
                `/api/v1/stats/servers/${serverId}/activities/${activityId}/metadata_definitions/${metadataDefinitionId}/distribution`,
                accessToken
            )
        }
    )

    // Get metadata value statistics
    ipcMain.handle(
        ipc_channels.activityMetadataDefinitionStats.getValueStats,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            value: string,
            params: IMetadataDefinitionStatsParams,
            accessToken: string
        ): Promise<
            IActivityMetadataDefinitionStatsApiResponse<IPaginatedResponseOfMetadataDefinitionDetailDto>
        > => {
            logger.info(
                'Getting metadata value stats:',
                serverId,
                activityId,
                metadataDefinitionId,
                value,
                params
            )

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata Definition ID'),
                validateRequired(value, 'Value'),
                validatePagination(params.page, params.limit),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IPaginatedResponseOfMetadataDefinitionDetailDto>(
                `/api/v1/stats/servers/${serverId}/activities/${activityId}/metadata_definitions/${metadataDefinitionId}/values/${encodeURIComponent(value)}${queryString}`,
                accessToken
            )
        }
    )

    // Get metadata definition timeline
    ipcMain.handle(
        ipc_channels.activityMetadataDefinitionStats.getTimeline,
        async (
            _event,
            serverId: string,
            activityId: string,
            metadataDefinitionId: string,
            params: IMetadataDefinitionTimelineParams | undefined,
            accessToken: string
        ): Promise<IActivityMetadataDefinitionStatsApiResponse<IMetadataTimelineDto[]>> => {
            logger.info(
                'Getting metadata definition timeline:',
                serverId,
                activityId,
                metadataDefinitionId,
                params
            )

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(metadataDefinitionId, 'Metadata Definition ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = params ? buildQueryParams(params) : ''

            return apiService.get<IMetadataTimelineDto[]>(
                `/api/v1/stats/servers/${serverId}/activities/${activityId}/metadata_definitions/${metadataDefinitionId}/timeline${queryString}`,
                accessToken
            )
        }
    )
}
