import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IServer,
    ICreateServerRequest,
    IUpdateServerRequest,
    IJoinServerRequest,
    IServerApiResponse
} from '../../../shared/contracts/interfaces/entities/server.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    combineValidations
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:Server')

/**
 * Register servers-related IPC handlers
 */
export function registerServerIpc(): void {
    // Create a new servers
    ipcMain.handle(
        ipc_channels.server.create,
        async (
            _event,
            request: ICreateServerRequest,
            accessToken: string
        ): Promise<IServerApiResponse<IServer>> => {
            logger.info('Creating servers:', request.name)

            // Validate input
            const validationError = combineValidations(
                validateRequired(request.name, 'Name'),
                validateRequired(request.type_public_id, 'type_public_id'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<IServer>('/api/v1/servers/create', accessToken, request)
        }
    )

    // Refresh servers invitation code
    ipcMain.handle(
        ipc_channels.server.refreshInviteCode,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerApiResponse<IServer>> => {
            logger.info('Refreshing invite code for servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<IServer>(
                `/api/v1/servers/${serverId}/invite-code/refresh`,
                accessToken
            )
        }
    )

    // Join a servers by invitation code
    ipcMain.handle(
        ipc_channels.server.join,
        async (
            _event,
            request: IJoinServerRequest,
            accessToken: string
        ): Promise<IServerApiResponse<void>> => {
            logger.info('Joining servers with code:', request.code)

            const validationError = combineValidations(
                validateRequired(request.code, 'Invitation code'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<void>('/api/v1/servers/join', accessToken, request)
        }
    )

    // Get servers details
    ipcMain.handle(
        ipc_channels.server.getDetails,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerApiResponse<IServer>> => {
            logger.info('Getting servers details:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IServer>(`/api/v1/servers/${serverId}`, accessToken)
        }
    )

    // Update servers details
    ipcMain.handle(
        ipc_channels.server.update,
        async (
            _event,
            serverId: string,
            request: IUpdateServerRequest,
            accessToken: string
        ): Promise<IServerApiResponse<IServer>> => {
            logger.info('Updating servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.put<IServer>(`/api/v1/servers/${serverId}`, accessToken, request)
        }
    )

    // Delete a servers
    ipcMain.handle(
        ipc_channels.server.delete,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IServerApiResponse<void>> => {
            logger.info('Deleting servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(`/api/v1/servers/${serverId}`, accessToken)
        }
    )

    logger.info('Server IPC handlers registered')
}
