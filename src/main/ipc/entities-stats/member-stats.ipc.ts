/**
 * Member Statistics IPC Handlers
 * Handles all member statistics-related IPC communication
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IMemberStats,
    IMemberStatsDetails,
    IMemberActivityPatterns,
    IMemberRanking,
    IMemberGrowthTrends,
    IMemberLeaderboard,
    IPaginatedMemberStats,
    ILeaderboardParams,
    IPaginationParams,
    IMemberTimelineParams,
    IMemberGrowthParams,
    IMemberStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import type { IStatsTimeline } from '../../../shared/contracts/interfaces/entities-stats/server-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    validatePagination,
    combineValidations,
    buildQueryParams
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:MemberStats')

export function registerMemberStatsIpc(): void {
    // Get member leaderboard
    ipcMain.handle(
        ipc_channels.memberStats.getLeaderboard,
        async (
            _event,
            serverId: string,
            params: ILeaderboardParams | undefined,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberLeaderboard>> => {
            logger.info('Getting member leaderboard:', serverId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IMemberLeaderboard>(
                `/api/v1/stats/servers/${serverId}/members/leaderboard${queryString}`,
                accessToken
            )
        }
    )

    // Get all members statistics (paginated)
    ipcMain.handle(
        ipc_channels.memberStats.getAllStats,
        async (
            _event,
            serverId: string,
            params: IPaginationParams,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IPaginatedMemberStats>> => {
            logger.info('Getting all members statistics:', serverId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validatePagination(params.page, params.limit),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IPaginatedMemberStats>(
                `/api/v1/stats/servers/${serverId}/members${queryString}`,
                accessToken
            )
        }
    )

    // Get member statistics
    ipcMain.handle(
        ipc_channels.memberStats.getStats,
        async (
            _event,
            serverId: string,
            memberId: string,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberStats>> => {
            logger.info('Getting member statistics:', serverId, memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IMemberStats>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}`,
                accessToken
            )
        }
    )

    // Get complete member details
    ipcMain.handle(
        ipc_channels.memberStats.getDetails,
        async (
            _event,
            serverId: string,
            memberId: string,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberStatsDetails>> => {
            logger.info('Getting member details:', serverId, memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IMemberStatsDetails>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}/details`,
                accessToken
            )
        }
    )

    // Get member activity patterns
    ipcMain.handle(
        ipc_channels.memberStats.getPatterns,
        async (
            _event,
            serverId: string,
            memberId: string,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberActivityPatterns>> => {
            logger.info('Getting member patterns:', serverId, memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IMemberActivityPatterns>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}/patterns`,
                accessToken
            )
        }
    )

    // Get member ranking
    ipcMain.handle(
        ipc_channels.memberStats.getRanking,
        async (
            _event,
            serverId: string,
            memberId: string,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberRanking>> => {
            logger.info('Getting member ranking:', serverId, memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IMemberRanking>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}/ranking`,
                accessToken
            )
        }
    )

    // Get member timeline
    ipcMain.handle(
        ipc_channels.memberStats.getTimeline,
        async (
            _event,
            serverId: string,
            memberId: string,
            params: IMemberTimelineParams | undefined,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IStatsTimeline[]>> => {
            logger.info('Getting member timeline:', serverId, memberId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IStatsTimeline[]>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}/timeline${queryString}`,
                accessToken
            )
        }
    )

    // Get member growth trends
    ipcMain.handle(
        ipc_channels.memberStats.getGrowthTrends,
        async (
            _event,
            serverId: string,
            memberId: string,
            params: IMemberGrowthParams | undefined,
            accessToken: string
        ): Promise<IMemberStatsApiResponse<IMemberGrowthTrends>> => {
            logger.info('Getting member growth trends:', serverId, memberId, params)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            const queryString = buildQueryParams(params)

            return apiService.get<IMemberGrowthTrends>(
                `/api/v1/stats/servers/${serverId}/members/${memberId}/growth-trends${queryString}`,
                accessToken
            )
        }
    )

    logger.info('Member stats IPC handlers registered')
}
