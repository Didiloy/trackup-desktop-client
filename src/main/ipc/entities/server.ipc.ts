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

const logger = new Logger('IPC:Server')

/**
 * Register server-related IPC handlers
 */
export function registerServerIpc(): void {
  // Create a new server
  ipcMain.handle(
    ipc_channels.server.create,
    async (
      _event,
      request: ICreateServerRequest,
      accessToken: string
    ): Promise<IServerApiResponse<IServer>> => {
      logger.info('Creating server:', request.name)

      // Validate input
      if (!request.name || !request.type_public_id) {
        return { error: 'Name and type_public_id are required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IServer>('/api/v1/servers/create', accessToken, request)
    }
  )

  // Refresh server invitation code
  ipcMain.handle(
    ipc_channels.server.refreshInviteCode,
    async (_event, serverId: string, accessToken: string): Promise<IServerApiResponse<IServer>> => {
      logger.info('Refreshing invite code for server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IServer>(
        `/api/v1/servers/${serverId}/invite-code/refresh`,
        accessToken
      )
    }
  )

  // Join a server by invitation code
  ipcMain.handle(
    ipc_channels.server.join,
    async (
      _event,
      request: IJoinServerRequest,
      accessToken: string
    ): Promise<IServerApiResponse<void>> => {
      logger.info('Joining server with code:', request.code)

      if (!request.code) {
        return { error: 'Invitation code is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<void>('/api/v1/servers/join', accessToken, request)
    }
  )

  // Get server details
  ipcMain.handle(
    ipc_channels.server.getDetails,
    async (_event, serverId: string, accessToken: string): Promise<IServerApiResponse<IServer>> => {
      logger.info('Getting server details:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IServer>(`/api/v1/servers/${serverId}`, accessToken)
    }
  )

  // Update server details
  ipcMain.handle(
    ipc_channels.server.update,
    async (
      _event,
      serverId: string,
      request: IUpdateServerRequest,
      accessToken: string
    ): Promise<IServerApiResponse<IServer>> => {
      logger.info('Updating server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.put<IServer>(`/api/v1/servers/${serverId}`, accessToken, request)
    }
  )

  // Delete a server
  ipcMain.handle(
    ipc_channels.server.delete,
    async (_event, serverId: string, accessToken: string): Promise<IServerApiResponse<void>> => {
      logger.info('Deleting server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(`/api/v1/servers/${serverId}`, accessToken)
    }
  )

  logger.info('Server IPC handlers registered')
}
