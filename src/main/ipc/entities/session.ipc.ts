import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  ISession,
  IPaginatedSessions,
  ICreateSessionRequest,
  IUpdateSessionRequest,
  IListSessionsOptions,
  ISessionApiResponse
} from '../../../shared/contracts/interfaces/entities/session.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'

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
      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!request.activity_id) {
        return { error: 'Activity ID is required' }
      }

      if (!request.duration || request.duration <= 0) {
        return { error: 'Duration must be greater than 0' }
      }

      if (!request.date) {
        return { error: 'Date is required' }
      }

      if (!request.participants || request.participants.length === 0) {
        return { error: 'At least one participant is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<ISession>(`/api/v1/servers/${serverId}/sessions`, accessToken, request)
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
      logger.info('Listing sessions for server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      // Build query parameters
      const params: Record<string, string | number> = {}
      if (options?.page) {
        params.page = options.page
      }
      if (options?.limit) {
        params.limit = options.limit
      }

      return apiService.get<IPaginatedSessions>(
        `/api/v1/servers/${serverId}/sessions`,
        accessToken,
        {
          params: Object.keys(params).length > 0 ? params : undefined
        }
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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!sessionId) {
        return { error: 'Session ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!sessionId) {
        return { error: 'Session ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!sessionId) {
        return { error: 'Session ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!sessionId) {
        return { error: 'Session ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

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

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!sessionId) {
        return { error: 'Session ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/sessions/${sessionId}/unlike`,
        accessToken
      )
    }
  )

  logger.info('Session IPC handlers registered')
}
