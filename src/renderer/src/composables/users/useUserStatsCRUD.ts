import { useUserStore } from '@/stores/user'
import type {
    IUserStats,
    IUserProfile,
    ILastSession,
    IAppSessionResponse
} from '@shared/contracts/interfaces/entities-stats/user-stats.interfaces'
import type { IUserApiResponse } from '@shared/contracts/interfaces/entities/user.interfaces'

interface UseUserStatsCRUDReturn {
    getStats: () => Promise<IUserApiResponse<IUserStats>>
    getProfile: () => Promise<IUserApiResponse<IUserProfile>>
    getLastSessions: (limit?: number) => Promise<IUserApiResponse<ILastSession[]>>
    startAppSession: () => Promise<IUserApiResponse<IAppSessionResponse>>
    endAppSession: (sessionId: string) => Promise<IUserApiResponse<void>>
}

export function useUserStatsCRUD(): UseUserStatsCRUDReturn {
    const user_store = useUserStore()

    const getStats = async (): Promise<IUserApiResponse<IUserStats>> => {
        return window.api.userStats.getStats(user_store.getAccessToken!)
    }

    const getProfile = async (): Promise<IUserApiResponse<IUserProfile>> => {
        return window.api.userStats.getProfile(user_store.getAccessToken!)
    }

    const getLastSessions = async (limit?: number): Promise<IUserApiResponse<ILastSession[]>> => {
        return window.api.userStats.getLastSessions(user_store.getAccessToken!, limit)
    }

    const startAppSession = async (): Promise<IUserApiResponse<IAppSessionResponse>> => {
        return window.api.userStats.startAppSession(user_store.getAccessToken!)
    }

    const endAppSession = async (sessionId: string): Promise<IUserApiResponse<void>> => {
        return window.api.userStats.endAppSession(user_store.getAccessToken!, sessionId)
    }

    return {
        getStats,
        getProfile,
        getLastSessions,
        startAppSession,
        endAppSession
    }
}
