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

interface UseSnapshotCRUDReturn {
    createSnapshot: (
        serverId: string,
        request: ICreateSnapshotRequest
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    listSnapshots: (
        serverId: string,
        params: IGetSnapshotsParams
    ) => Promise<ISnapshotApiResponse<IPaginatedSnapshots>>
    getSnapshotById: (
        serverId: string,
        snapshotId: string
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    getLatestSnapshot: (
        serverId: string,
        params: IGetLatestSnapshotParams
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    getSnapshotsSummary: (serverId: string) => Promise<ISnapshotApiResponse<ISnapshotSummary>>
    compareSnapshots: (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string
    ) => Promise<ISnapshotApiResponse<ISnapshotComparisonResult>>
    deleteSnapshot: (
        serverId: string,
        snapshotId: string
    ) => Promise<ISnapshotApiResponse<ISnapshot>>
    cleanupSnapshots: (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ) => Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>>
    downloadSnapshot: (serverId: string, snapshotId: string) => Promise<void>
}

/**
 * Composable for Snapshot entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useSnapshotCRUD(): UseSnapshotCRUDReturn {
    const userStore = useUserStore()

    /**
     * Create a manual snapshot for a server
     * @param serverId - The server ID
     * @param request - Snapshot creation request with type, title, and description
     */
    const createSnapshot = async (
        serverId: string,
        request: ICreateSnapshotRequest
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.create(serverId, request, userStore.getAccessToken!)
    }

    /**
     * List all snapshots for a server with pagination and filters
     * @param serverId - The server ID
     * @param params - Pagination and filter parameters
     */
    const listSnapshots = async (
        serverId: string,
        params: IGetSnapshotsParams
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
        return window.api.snapshotStats.getAll(serverId, params, userStore.getAccessToken!)
    }

    /**
     * Get a specific snapshot by ID
     * @param serverId - The server ID
     * @param snapshotId - The snapshot ID
     */
    const getSnapshotById = async (
        serverId: string,
        snapshotId: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.getById(serverId, snapshotId, userStore.getAccessToken!)
    }

    /**
     * Get the latest snapshot of a specific type
     * @param serverId - The server ID
     * @param params - Parameters specifying the snapshot type
     */
    const getLatestSnapshot = async (
        serverId: string,
        params: IGetLatestSnapshotParams
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.getLatest(serverId, params, userStore.getAccessToken!)
    }

    /**
     * Get summary of latest snapshots by type
     * @param serverId - The server ID
     */
    const getSnapshotsSummary = async (
        serverId: string
    ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
        return window.api.snapshotStats.getSummary(serverId, userStore.getAccessToken!)
    }

    /**
     * Compare two snapshots and return the differences
     * @param serverId - The server ID
     * @param snapshotId1 - First snapshot ID (older)
     * @param snapshotId2 - Second snapshot ID (newer)
     */
    const compareSnapshots = async (
        serverId: string,
        snapshotId1: string,
        snapshotId2: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
        return window.api.snapshotStats.compare(
            serverId,
            snapshotId1,
            snapshotId2,
            userStore.getAccessToken!
        )
    }

    /**
     * Delete a specific snapshot
     * @param serverId - The server ID
     * @param snapshotId - The snapshot ID to delete
     */
    const deleteSnapshot = async (
        serverId: string,
        snapshotId: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
        return window.api.snapshotStats.delete(serverId, snapshotId, userStore.getAccessToken!)
    }

    /**
     * Cleanup old snapshots older than specified days
     * @param serverId - The server ID
     * @param params - Optional cleanup parameters (days threshold)
     */
    const cleanupSnapshots = async (
        serverId: string,
        params?: ICleanupSnapshotsParams
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
        return window.api.snapshotStats.cleanup(serverId, params, userStore.getAccessToken!)
    }

    /**
     * Download a snapshot as JSON file
     * @param serverId - The server ID
     * @param snapshotId - The snapshot ID to download
     */
    const downloadSnapshot = async (serverId: string, snapshotId: string): Promise<void> => {
        const res = await getSnapshotById(serverId, snapshotId)
        if (res.error || !res.data) {
            throw new Error('Failed to fetch snapshot data')
        }

        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const filename = `snapshot-${res.data.title || res.data.snapshot_type}-${new Date(res.data.snapshot_date).toLocaleDateString()}.json`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return {
        createSnapshot,
        listSnapshots,
        getSnapshotById,
        getLatestSnapshot,
        getSnapshotsSummary,
        compareSnapshots,
        deleteSnapshot,
        cleanupSnapshots,
        downloadSnapshot
    }
}
