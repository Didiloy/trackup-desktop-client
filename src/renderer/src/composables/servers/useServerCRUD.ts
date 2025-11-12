import { useUserStore } from '@/stores/user'
import type {
    IServer,
    ICreateServerRequest,
    IUpdateServerRequest,
    IJoinServerRequest,
    IServerApiResponse
} from '../../../../shared/contracts/interfaces/entities/server.interfaces'

interface UseServerCRUDReturn {
    createServer: (request: ICreateServerRequest) => Promise<IServerApiResponse<IServer>>
    refreshInviteCode: (serverId: string) => Promise<IServerApiResponse<IServer>>
    joinServer: (request: IJoinServerRequest) => Promise<IServerApiResponse<void>>
    getServerDetails: (serverId: string) => Promise<IServerApiResponse<IServer>>
    updateServer: (
        serverId: string,
        request: IUpdateServerRequest
    ) => Promise<IServerApiResponse<IServer>>
    deleteServer: (serverId: string) => Promise<IServerApiResponse<void>>
}

/**
 * Composable for Server entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useServerCRUD(): UseServerCRUDReturn {
    const user_store = useUserStore()

    /**
     * Create a new servers
     */
    const createServer = async (
        request: ICreateServerRequest
    ): Promise<IServerApiResponse<IServer>> => {
        return window.api.server.create(request, user_store.getAccessToken!)
    }

    /**
     * Refresh servers invitation code
     */
    const refreshInviteCode = async (serverId: string): Promise<IServerApiResponse<IServer>> => {
        return window.api.server.refreshInviteCode(serverId, user_store.getAccessToken!)
    }

    /**
     * Join a servers by invitation code
     */
    const joinServer = async (request: IJoinServerRequest): Promise<IServerApiResponse<void>> => {
        return window.api.server.join(request, user_store.getAccessToken!)
    }

    /**
     * Get servers details
     */
    const getServerDetails = async (serverId: string): Promise<IServerApiResponse<IServer>> => {
        return window.api.server.getDetails(serverId, user_store.getAccessToken!)
    }

    /**
     * Update servers details
     */
    const updateServer = async (
        serverId: string,
        request: IUpdateServerRequest
    ): Promise<IServerApiResponse<IServer>> => {
        return window.api.server.update(serverId, request, user_store.getAccessToken!)
    }

    /**
     * Delete a servers
     */
    const deleteServer = async (serverId: string): Promise<IServerApiResponse<void>> => {
        return window.api.server.delete(serverId, user_store.getAccessToken!)
    }

    return {
        createServer,
        refreshInviteCode,
        joinServer,
        getServerDetails,
        updateServer,
        deleteServer
    }
}
