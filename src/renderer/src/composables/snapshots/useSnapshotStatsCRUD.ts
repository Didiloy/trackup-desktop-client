import { useUserStore } from '@/stores/user'
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
} from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

interface UseSnapshotStatsCRUDReturn {
    createSnapshotStats: (
        serverId: string,
        request: ICreateSnapshotRequest
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    getAllSnapshotsStats: (
        serverId: string,
        params: IGetSnapshotsParams
    ) => Promise<ISnapshotApiResponse<IPaginatedSnapshots>>
    getSnapshotStatsById: (
        serverId: string,
        snapshotId: string
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    getLatestSnapshotStats: (
        serverId: string,
        params: IGetLatestSnapshotParams
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    getSnapshotsStatsSummary: (serverId: string) => Promise<ISnapshotApiResponse<ISnapshotSummary>>
    compareSnapshotsStats: (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string
    ) => Promise<ISnapshotApiResponse<ISnapshotComparisonResult>>
    cleanupSnapshotsStats: (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ) => Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>>
}

/**
 * Composable for Snapshot Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useSnapshotStatsCRUD(): UseSnapshotStatsCRUDReturn {
    const user_store = useUserStore()

    /**
     * Create a manual snapshot
     */
    const createSnapshotStats = async (
        serverId: string,
        request: ICreateSnapshotRequest
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.create(serverId, request, user_store.getAccessToken!)
    }

    /**
     * Get all snapshots (paginated)
     */
    const getAllSnapshotsStats = async (
        serverId: string,
        params: IGetSnapshotsParams
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        return window.api.snapshotStats.getAll(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get a specific snapshot
     */
    const getSnapshotStatsById = async (
        serverId: string,
        snapshotId: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.getById(serverId, snapshotId, user_store.getAccessToken!)
    }

    /**
     * Get the latest snapshot by type
     */
    const getLatestSnapshotStats = async (
        serverId: string,
        params: IGetLatestSnapshotParams
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.getLatest(serverId, params, user_store.getAccessToken!)
    }

    /**
     * Get summary of latest snapshots by type
     */
    const getSnapshotsStatsSummary = async (
        serverId: string
    ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
        return window.api.snapshotStats.getSummary(serverId, user_store.getAccessToken!)
    }

    /**
     * Compare two snapshots
     */
    const compareSnapshotsStats = async (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
        return window.api.snapshotStats.compare(
            serverId,
            snapshotId1,
            snapshotId2,
            user_store.getAccessToken!
        )
    }

    /**
     * Cleanup old snapshots
     */
    const cleanupSnapshotsStats = async (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        return window.api.snapshotStats.cleanup(serverId, params, user_store.getAccessToken!)
    }

    return {
        createSnapshotStats,
        getAllSnapshotsStats,
        getSnapshotStatsById,
        getLatestSnapshotStats,
        getSnapshotsStatsSummary,
        compareSnapshotsStats,
        cleanupSnapshotsStats
    }
}
