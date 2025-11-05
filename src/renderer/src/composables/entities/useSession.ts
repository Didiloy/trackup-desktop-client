import { useUserStore } from '@/stores/user'
import type {
  ISession,
  IPaginatedSessions,
  ICreateSessionRequest,
  IUpdateSessionRequest,
  IListSessionsOptions,
  ISessionApiResponse
} from '../../../../shared/contracts/interfaces/entities/session.interfaces'

/**
 * Composable for Session entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useSession() {
  const user_store = useUserStore()

  /**
   * Create a new session
   */
  const createSession = async (
    serverId: string,
    request: ICreateSessionRequest
  ): Promise<ISessionApiResponse<ISession>> => {
    return window.api.session.create(serverId, request, user_store.getAccessToken!)
  }

  /**
   * List paginated sessions
   */
  const listSessions = async (
    serverId: string,
    options?: IListSessionsOptions
  ): Promise<ISessionApiResponse<IPaginatedSessions>> => {
    return window.api.session.list(serverId, options, user_store.getAccessToken!)
  }

  /**
   * Get session by ID
   */
  const getSessionById = async (
    serverId: string,
    sessionId: string
  ): Promise<ISessionApiResponse<ISession>> => {
    return window.api.session.getById(serverId, sessionId, user_store.getAccessToken!)
  }

  /**
   * Update a session
   */
  const updateSession = async (
    serverId: string,
    sessionId: string,
    request: IUpdateSessionRequest
  ): Promise<ISessionApiResponse<ISession>> => {
    return window.api.session.update(serverId, sessionId, request, user_store.getAccessToken!)
  }

  /**
   * Delete a session
   */
  const deleteSession = async (
    serverId: string,
    sessionId: string
  ): Promise<ISessionApiResponse<void>> => {
    return window.api.session.delete(serverId, sessionId, user_store.getAccessToken!)
  }

  /**
   * Like a session
   */
  const likeSession = async (
    serverId: string,
    sessionId: string
  ): Promise<ISessionApiResponse<void>> => {
    return window.api.session.like(serverId, sessionId, user_store.getAccessToken!)
  }

  /**
   * Unlike a session
   */
  const unlikeSession = async (
    serverId: string,
    sessionId: string
  ): Promise<ISessionApiResponse<void>> => {
    return window.api.session.unlike(serverId, sessionId, user_store.getAccessToken!)
  }

  return {
    createSession,
    listSessions,
    getSessionById,
    updateSession,
    deleteSession,
    likeSession,
    unlikeSession
  }
}
