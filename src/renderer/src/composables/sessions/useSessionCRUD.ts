import { useUserStore } from '@/stores/user'
import type {
    ISession,
    IPaginatedSessions,
    IUpdateSessionRequest,
    IUpdateSessionParticipantsRequest,
    IListSessionsOptions,
    ISessionApiResponse,
    IAddSessionEnumsRequest,
    IAddSessionMetadataRequest
    // IUpdateSessionEnumSelectionRequest,
    // ISessionEnumSelectionDetail
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
    updateSessionParticipants: (
        serverId: string,
        sessionId: string,
        request: IUpdateSessionParticipantsRequest
    ) => Promise<ISessionApiResponse<ISession>>
    deleteSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    likeSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    unlikeSession: (serverId: string, sessionId: string) => Promise<ISessionApiResponse<void>>
    addSessionEnums: (
        serverId: string,
        sessionId: string,
        request: IAddSessionEnumsRequest
    ) => Promise<ISessionApiResponse<ISession>>
    addSessionMetadata: (
        serverId: string,
        sessionId: string,
        request: IAddSessionMetadataRequest
    ) => Promise<ISessionApiResponse<ISession>>
    // updateSessionEnumSelection: (
    //     serverId: string,
    //     sessionId: string,
    //     enumSelectionId: string,
    //     request: IUpdateSessionEnumSelectionRequest
    // ) => Promise<ISessionApiResponse<void>>
    // getSessionEnumSelection: (
    //     serverId: string,
    //     sessionId: string,
    //     enumSelectionId: string
    // ) => Promise<ISessionApiResponse<ISessionEnumSelectionDetail>>
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
     * Update session participants (creator only)
     */
    const updateSessionParticipants = async (
        serverId: string,
        sessionId: string,
        request: IUpdateSessionParticipantsRequest
    ): Promise<ISessionApiResponse<ISession>> => {
        return window.api.session.updateParticipants(
            serverId,
            sessionId,
            request,
            user_store.getAccessToken!
        )
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
     * Add metadata to a session
     */
    const addSessionMetadata = async (
        serverId: string,
        sessionId: string,
        request: IAddSessionMetadataRequest
    ): Promise<ISessionApiResponse<ISession>> => {
        return window.api.session.addMetadata(
            serverId,
            sessionId,
            request,
            user_store.getAccessToken!
        )
    }

    return {
        listSessions,
        getSessionById,
        updateSession,
        updateSessionParticipants,
        deleteSession,
        likeSession,
        unlikeSession,
        addSessionEnums,
        addSessionMetadata
    }
}
