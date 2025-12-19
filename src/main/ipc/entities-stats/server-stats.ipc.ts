/**
 * Server Statistics IPC Handlers
 * Handles all servers statistics-related IPC communication
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IServerStats,
    IServerStatsDetails,
    IStatsTimeline,
    IServerGrowthResponse,
    IComparativeAnalysis,
    IStatsTimelineParams,
    IStatsGrowthParams,
    IServerStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    buildQueryParams,
    combineValidations,
    validateAuth,
    validateRequired
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:ServerStats')

export function registerServerStatsIpc(): void {
    // Get servers statistics
    ipcMain.handle(
        ipc_channels.serverStats.getStats,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerStatsApiResponse<IServerStats>> => {
            logger.info('Getting servers statistics:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IServerStats>(`/api/v1/stats/servers/${serverId}`, accessToken)
        }
    )

    // Get complete servers stats details
    ipcMain.handle(
        ipc_channels.serverStats.getDetails,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerStatsApiResponse<IServerStatsDetails>> => {
            logger.info('Getting servers stats details:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IServerStatsDetails>(
                `/api/v1/stats/servers/${serverId}/details`,
                accessToken
            )
        }
    )

    // Get servers timeline
    ipcMain.handle(
        ipc_channels.serverStats.getTimeline,
        async (
            _event,
            serverId: string,
            params: IStatsTimelineParams | undefined,
            accessToken: string
        ): Promise<IServerStatsApiResponse<IStatsTimeline[]>> => {
            logger.info('Getting servers timeline:', serverId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IStatsTimeline[]>(
                `/api/v1/stats/servers/${serverId}/timeline${queryString}`,
                accessToken
            )
        }
    )

    // Get servers growth trends
    ipcMain.handle(
        ipc_channels.serverStats.getGrowthTrends,
        async (
            _event,
            serverId: string,
            params: IStatsGrowthParams | undefined,
            accessToken: string
        ): Promise<IServerStatsApiResponse<IServerGrowthResponse>> => {
            logger.info('Getting servers growth trends:', serverId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IServerGrowthResponse>(
                `/api/v1/stats/servers/${serverId}/growth-trends${queryString}`,
                accessToken
            )
        }
    )

    // Get comparative analysis
    ipcMain.handle(
        ipc_channels.serverStats.getComparativeAnalysis,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerStatsApiResponse<IComparativeAnalysis[]>> => {
            logger.info('Getting comparative analysis:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IComparativeAnalysis[]>(
                `/api/v1/stats/servers/${serverId}/comparative-analysis`,
                accessToken
            )
        }
    )

    logger.info('Server stats IPC handlers registered')
}
