import { useUserStore } from '@/stores/user'
import type {
    ISession,
    IPaginatedSessions,
    IUpdateSessionRequest,
    IListSessionsOptions,
    ISessionApiResponse,
    IAddSessionEnumsRequest,
    IUpdateSessionEnumSelectionRequest,
    ISessionEnumSelectionDetail
} from '@shared/contracts/interfaces/entities/session.interfaces'

interface UseSessionCRUDReturn {
    listSessions: (
        serverId: string,
        options?: IListSessionsOptions
    ) => Promise<ISessionApiResponse<IPaginatedSessions>>
    getSessionById: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<ISession>>
    updateSession: (
        serverId: string,
        sessionId: string,
        request: IUpdateSessionRequest
    ) => Promise<ISessionApiResponse<ISession>>
    deleteSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    likeSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    unlikeSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    addSessionEnums: (
        serverId: string,
        sessionId: string,
        request: IAddSessionEnumsRequest
    ) => Promise<ISessionApiResponse<ISession>>
    updateSessionEnumSelection: (
        serverId: string,
        sessionId: string,
        enumSelectionId: string,
        request: IUpdateSessionEnumSelectionRequest
    ) => Promise<ISessionApiResponse<void>>
    getSessionEnumSelection: (
        serverId: string,
        sessionId: string,
        enumSelectionId: string
    ) => Promise<ISessionApiResponse<ISessionEnumSelectionDetail>>
}

/**
 * Composable for Session entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useSessionCRUD(): UseSessionCRUDReturn {
    const user_store = useUserStore()



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

    /**
     * Add enum selections to a session
     */
    const addSessionEnums = async (
        serverId: string,
        sessionId: string,
        request: IAddSessionEnumsRequest
    ): Promise<ISessionApiResponse<ISession>> => {
        return window.api.session.addEnums(serverId, sessionId, request, user_store.getAccessToken!)
    }

    /**
     * Update enum selection in a session
     */
    const updateSessionEnumSelection = async (
        serverId: string,
        sessionId: string,
        enumSelectionId: string,
        request: IUpdateSessionEnumSelectionRequest
    ): Promise<ISessionApiResponse<void>> => {
        return window.api.session.updateEnumSelection(
            serverId,
            sessionId,
            enumSelectionId,
            request,
            user_store.getAccessToken!
        )
    }

    /**
     * Get enum selection details
     */
    const getSessionEnumSelection = async (
        serverId: string,
        sessionId: string,
        enumSelectionId: string
    ): Promise<ISessionApiResponse<ISessionEnumSelectionDetail>> => {
        return window.api.session.getEnumSelection(
            serverId,
            sessionId,
            enumSelectionId,
            user_store.getAccessToken!
        )
    }

    return {
        listSessions,
        getSessionById,
        updateSession,
        deleteSession,
        likeSession,
        unlikeSession,
        addSessionEnums,
        updateSessionEnumSelection,
        getSessionEnumSelection
    }
}
