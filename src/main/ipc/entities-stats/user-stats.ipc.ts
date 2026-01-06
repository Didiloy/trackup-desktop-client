import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IUserStats,
    IUserProfile,
    ILastSession,
    IAppSessionResponse
} from '../../../shared/contracts/interfaces/entities-stats/user-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import { validateAuth } from '../../../shared/helpers/index.helpers'
import { IUserApiResponse } from '../../../shared/contracts/interfaces/entities/user.interfaces'

const logger = new Logger('IPC:UserStats')

/**
 * Register user stats IPC handlers
 */
export function registerUserStatsIpc(): void {
    // Get current user stats
    ipcMain.handle(
        ipc_channels.userStats.getStats,
        async (_event, accessToken: string): Promise<IUserApiResponse<IUserStats>> => {
            logger.info('Getting user stats')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            return apiService.get<IUserStats>('/api/v1/users/me/stats', accessToken)
        }
    )

    // Get current user profile
    ipcMain.handle(
        ipc_channels.userStats.getProfile,
        async (_event, accessToken: string): Promise<IUserApiResponse<IUserProfile>> => {
            logger.info('Getting user profile')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            return apiService.get<IUserProfile>('/api/v1/users/me/stats/profile', accessToken)
        }
    )

    // Get last sessions
    ipcMain.handle(
        ipc_channels.userStats.getLastSessions,
        async (_event, accessToken: string, limit?: number): Promise<IUserApiResponse<ILastSession[]>> => {
            logger.info('Getting last sessions')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            const queryParams = limit ? `?limit=${limit}` : ''
            return apiService.get<ILastSession[]>(`/api/v1/users/me/stats/last-sessions${queryParams}`, accessToken)
        }
    )

    // Start app session
    ipcMain.handle(
        ipc_channels.userStats.startAppSession,
        async (_event, accessToken: string): Promise<IUserApiResponse<IAppSessionResponse>> => {
            logger.info('Starting app session')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            return apiService.post<IAppSessionResponse>('/api/v1/users/me/stats/app-session/start', accessToken, {})
        }
    )

    // End app session
    ipcMain.handle(
        ipc_channels.userStats.endAppSession,
        async (_event, accessToken: string, sessionId: string): Promise<IUserApiResponse<void>> => {
            logger.info('Ending app session')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            return apiService.post<void>(`/api/v1/users/me/stats/app-session/${sessionId}/end`, accessToken, {})
        }
    )

    logger.info('User Stats IPC handlers registered')
}
