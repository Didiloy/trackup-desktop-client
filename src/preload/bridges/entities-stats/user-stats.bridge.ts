/**
 * User Stats Bridge
 */
import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IUserStats,
    IUserProfile,
    ILastSession,
    IAppSessionResponse
} from '../../../shared/contracts/interfaces/entities-stats/user-stats.interfaces'
import type { IUserApiResponse } from '../../../shared/contracts/interfaces/entities/user.interfaces'

export const userStatsBridge = {
    getStats: (accessToken: string): Promise<IUserApiResponse<IUserStats>> => {
        return ipcRenderer.invoke(ipc_channels.userStats.getStats, accessToken)
    },
    getProfile: (accessToken: string): Promise<IUserApiResponse<IUserProfile>> => {
        return ipcRenderer.invoke(ipc_channels.userStats.getProfile, accessToken)
    },
    getLastSessions: (
        accessToken: string,
        limit?: number
    ): Promise<IUserApiResponse<ILastSession[]>> => {
        return ipcRenderer.invoke(ipc_channels.userStats.getLastSessions, accessToken, limit)
    },
    startAppSession: (accessToken: string): Promise<IUserApiResponse<IAppSessionResponse>> => {
        return ipcRenderer.invoke(ipc_channels.userStats.startAppSession, accessToken)
    },
    endAppSession: (
        accessToken: string,
        sessionId: string
    ): Promise<IUserApiResponse<void>> => {
        return ipcRenderer.invoke(ipc_channels.userStats.endAppSession, accessToken, sessionId)
    }
}

export type UserStatsBridge = typeof userStatsBridge
