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

// Session State Management
let activeSessionId: string | null = null
let activeToken: string | null = null
let sessionTimeout: NodeJS.Timeout | null = null

// 8 hours in milliseconds
const SESSION_MAX_DURATION = 8 * 60 * 60 * 1000

/**
 * End the currently active session if any
 */
export async function endActiveSession(): Promise<void> {
    if (activeSessionId && activeToken) {
        logger.info(`Ending active app session: ${activeSessionId}`)
        try {
            await apiService.post<void>(
                `/api/v1/users/me/stats/app-session/${activeSessionId}/end`,
                activeToken,
                {}
            )
        } catch (error) {
            logger.error('Failed to end active session on cleanup', error)
        }
    }

    // Clear state
    activeSessionId = null
    activeToken = null
    if (sessionTimeout) {
        clearTimeout(sessionTimeout)
        sessionTimeout = null
    }
}

/**
 * Start a new active session
 */
async function startActiveSession(accessToken: string): Promise<IUserApiResponse<IAppSessionResponse>> {
    // End previous session if exists
    if (activeSessionId) {
        await endActiveSession()
    }

    const response = await apiService.post<IAppSessionResponse>(
        '/api/v1/users/me/stats/app-session/start',
        accessToken,
        {}
    )

    if (response.data) {
        activeSessionId = response.data.session_id
        activeToken = accessToken

        // Set autoclose timeout (8h) and RESTART
        if (sessionTimeout) clearTimeout(sessionTimeout)
        sessionTimeout = setTimeout(async () => {
            logger.info('Session timed out (8h Limit). Restarting new session...')
            // Capture token to reuse
            const tokenToReuse = activeToken

            // End current
            await endActiveSession()

            // Restart if we have the token
            if (tokenToReuse) {
                await startActiveSession(tokenToReuse)
            }
        }, SESSION_MAX_DURATION)
    }

    return response
}

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

            return startActiveSession(accessToken)
        }
    )

    // End app session
    ipcMain.handle(
        ipc_channels.userStats.endAppSession,
        async (_event, accessToken: string, sessionId: string): Promise<IUserApiResponse<void>> => {
            logger.info('Ending app session')

            const validationError = validateAuth(accessToken)
            if (validationError) return validationError

            // Clear local state if matches or just force strict end
            if (activeSessionId === sessionId || activeSessionId) {
                await endActiveSession()
            } else {
                // Fallback if ID doesn't match but we want to ensure request goes through
                return apiService.post<void>(`/api/v1/users/me/stats/app-session/${sessionId}/end`, accessToken, {})
            }

            return { data: undefined }
        }
    )

    logger.info('User Stats IPC handlers registered')
}
