/**
 * Snapshot Statistics Bridge
 * Exposes snapshot statistics API to the renderer process
 */

import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    ISnapshot,
    ISnapshotSummary,
    ISnapshotComparisonResult,
    IPaginatedSnapshots,
    ICreateSnapshotRequest,
    IGetSnapshotsParams,
    IGetLatestSnapshotParams,
    ICleanupSnapshotsParams,
    ICleanupSnapshotsResponse,
    ISnapshotApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

export const snapshotStatsBridge = {
    /**
     * Create a manual snapshot
     */
    create: (
        serverId: string,
        request: ICreateSnapshotRequest,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return ipcRenderer.invoke(ipc_channels.snapshotStats.create, serverId, request, accessToken)
    },

    /**
     * Get all snapshots (paginated)
     */
    getAll: (
        serverId: string,
        params: IGetSnapshotsParams,
        accessToken: string
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        return ipcRenderer.invoke(ipc_channels.snapshotStats.getAll, serverId, params, accessToken)
    },

    /**
     * Get a specific snapshot
     */
    getById: (
        serverId: string,
        snapshotId: string,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return ipcRenderer.invoke(
            ipc_channels.snapshotStats.getById,
            serverId,
            snapshotId,
            accessToken
        )
    },

    /**
     * Get the latest snapshot by type
     */
    getLatest: (
        serverId: string,
        params: IGetLatestSnapshotParams,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return ipcRenderer.invoke(
            ipc_channels.snapshotStats.getLatest,
            serverId,
            params,
            accessToken
        )
    },

    /**
     * Get summary of latest snapshots by type
     */
    getSummary: (
        serverId: string,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
        return ipcRenderer.invoke(ipc_channels.snapshotStats.getSummary, serverId, accessToken)
    },

    /**
     * Compare two snapshots
     */
    compare: (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
        return ipcRenderer.invoke(
            ipc_channels.snapshotStats.compare,
            serverId,
            snapshotId1,
            snapshotId2,
            accessToken
        )
    },

    /**
     * Cleanup old snapshots
     */
    cleanup: (
        serverId: string,
        params: ICleanupSnapshotsParams | undefined,
        accessToken: string
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        return ipcRenderer.invoke(ipc_channels.snapshotStats.cleanup, serverId, params, accessToken)
    }
}

export type SnapshotStatsBridge = typeof snapshotStatsBridge
