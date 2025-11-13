import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    ISession,
    IPaginatedSessions,
    ICreateSessionRequest,
    IUpdateSessionRequest,
    IListSessionsOptions,
    ISessionApiResponse,
    IAddSessionEnumsRequest
} from '../../../shared/contracts/interfaces/entities/session.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    validatePositive,
    validateNotEmpty,
    combineValidations,
    buildRequestOptions
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:Session')

/**
 * Register session-related IPC handlers
 */
export function registerSessionIpc(): void {
    // Create a new session
    ipcMain.handle(
        ipc_channels.session.create,
        async (
            _event,
            serverId: string,
            request: ICreateSessionRequest,
            accessToken: string
        ): Promise<ISessionApiResponse<ISession>> => {
            logger.info('Creating session for activity:', request.activity_id)

            // Validate input
            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(request.activity_id, 'Activity ID'),
                validatePositive(request.duration, 'Duration'),
                validateRequired(request.date, 'Date'),
                validateNotEmpty(request.participants, 'At least one participant'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<ISession>(
                `/api/v1/servers/${serverId}/sessions`,
                accessToken,
                request
            )
        }
    )

    // List paginated sessions
    ipcMain.handle(
        ipc_channels.session.list,
        async (
            _event,
            serverId: string,
            options: IListSessionsOptions | undefined,
            accessToken: string
        ): Promise<ISessionApiResponse<IPaginatedSessions>> => {
            logger.info('Listing sessions for servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IPaginatedSessions>(
                `/api/v1/servers/${serverId}/sessions`,
                accessToken,
                buildRequestOptions(options)
            )
        }
    )

    // Get session by ID
    ipcMain.handle(
        ipc_channels.session.getById,
        async (
            _event,
            serverId: string,
            sessionId: string,
            accessToken: string
        ): Promise<ISessionApiResponse<ISession>> => {
            logger.info('Getting session details:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<ISession>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}`,
                accessToken
            )
        }
    )

    // Update a session
    ipcMain.handle(
        ipc_channels.session.update,
        async (
            _event,
            serverId: string,
            sessionId: string,
            request: IUpdateSessionRequest,
            accessToken: string
        ): Promise<ISessionApiResponse<ISession>> => {
            logger.info('Updating session:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.put<ISession>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}`,
                accessToken,
                request
            )
        }
    )

    // Delete a session
    ipcMain.handle(
        ipc_channels.session.delete,
        async (
            _event,
            serverId: string,
            sessionId: string,
            accessToken: string
        ): Promise<ISessionApiResponse<void>> => {
            logger.info('Deleting session:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}`,
                accessToken
            )
        }
    )

    // Like a session
    ipcMain.handle(
        ipc_channels.session.like,
        async (
            _event,
            serverId: string,
            sessionId: string,
            accessToken: string
        ): Promise<ISessionApiResponse<void>> => {
            logger.info('Liking session:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<void>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}/like`,
                accessToken
            )
        }
    )

    // Unlike a session
    ipcMain.handle(
        ipc_channels.session.unlike,
        async (
            _event,
            serverId: string,
            sessionId: string,
            accessToken: string
        ): Promise<ISessionApiResponse<void>> => {
            logger.info('Unliking session:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}/unlike`,
                accessToken
            )
        }
    )

    // Add enum selections to a session
    ipcMain.handle(
        ipc_channels.session.addEnums,
        async (
            _event,
            serverId: string,
            sessionId: string,
            request: IAddSessionEnumsRequest,
            accessToken: string
        ): Promise<ISessionApiResponse<ISession>> => {
            logger.info('Adding enum selections to session:', sessionId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(sessionId, 'Session ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            // Basic validation of selections
            if (!request?.selections?.length) {
                return { error: 'At least one enum selection is required' }
            }
            for (const sel of request.selections) {
                if (!sel.enum_value_id || !sel.selected_key) {
                    return { error: 'Invalid enum selection entry' }
                }
            }

            return apiService.post<ISession>(
                `/api/v1/servers/${serverId}/sessions/${sessionId}/enums`,
                accessToken,
                request
            )
        }
    )

    logger.info('Session IPC handlers registered')
}
