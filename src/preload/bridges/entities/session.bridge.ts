import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  ISession,
  IPaginatedSessions,
  ICreateSessionRequest,
  IUpdateSessionRequest,
  IListSessionsOptions,
  ISessionApiResponse
} from '../../../shared/contracts/interfaces/entities/session.interfaces'

/**
 * Session API Bridge
 * Exposes session-related functions to the renderer
 */
export const sessionBridge = {
  /**
   * Create a new session
   */
  create: (
    serverId: string,
    request: ICreateSessionRequest,
    accessToken: string
  ): Promise<ISessionApiResponse<ISession>> => {
    return ipcRenderer.invoke(ipc_channels.session.create, serverId, request, accessToken)
  },

  /**
   * List sessions with pagination
   */
  list: (
    serverId: string,
    options: IListSessionsOptions | undefined,
    accessToken: string
  ): Promise<ISessionApiResponse<IPaginatedSessions>> => {
    return ipcRenderer.invoke(ipc_channels.session.list, serverId, options, accessToken)
  },

  /**
   * Get details of a specific session
   */
  getById: (
    serverId: string,
    sessionId: string,
    accessToken: string
  ): Promise<ISessionApiResponse<ISession>> => {
    return ipcRenderer.invoke(ipc_channels.session.getById, serverId, sessionId, accessToken)
  },

  /**
   * Update a session (creator only)
   */
  update: (
    serverId: string,
    sessionId: string,
    request: IUpdateSessionRequest,
    accessToken: string
  ): Promise<ISessionApiResponse<ISession>> => {
    return ipcRenderer.invoke(
      ipc_channels.session.update,
      serverId,
      sessionId,
      request,
      accessToken
    )
  },

  /**
   * Delete a session (creator only)
   */
  delete: (
    serverId: string,
    sessionId: string,
    accessToken: string
  ): Promise<ISessionApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.session.delete, serverId, sessionId, accessToken)
  },

  /**
   * Like a session (toggles like)
   */
  like: (
    serverId: string,
    sessionId: string,
    accessToken: string
  ): Promise<ISessionApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.session.like, serverId, sessionId, accessToken)
  },

  /**
   * Unlike a session (removes like)
   */
  unlike: (
    serverId: string,
    sessionId: string,
    accessToken: string
  ): Promise<ISessionApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.session.unlike, serverId, sessionId, accessToken)
  }
}

export type SessionBridge = typeof sessionBridge
