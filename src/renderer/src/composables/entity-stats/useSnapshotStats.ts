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
} from '../../../../shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

/**
 * Composable for Snapshot Stats operations
 * Each method is independent and contains all necessary parameters
 */
export function useSnapshotStats() {
  const user_store = useUserStore()

  /**
   * Create a manual snapshot
   */
  const createSnapshot = async (
    serverId: string,
    request: ICreateSnapshotRequest
  ): Promise<ISnapshotApiResponse<ISnapshot>> => {
    return window.api.snapshotStats.create(serverId, request, user_store.getAccessToken!)
  }

  /**
   * Get all snapshots (paginated)
   */
  const getAllSnapshots = async (
    serverId: string,
    params: IGetSnapshotsParams
  ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
    return window.api.snapshotStats.getAll(serverId, params, user_store.getAccessToken!)
  }

  /**
   * Get a specific snapshot
   */
  const getSnapshotById = async (
    serverId: string,
    snapshotId: string
  ): Promise<ISnapshotApiResponse<ISnapshot>> => {
    return window.api.snapshotStats.getById(serverId, snapshotId, user_store.getAccessToken!)
  }

  /**
   * Get the latest snapshot by type
   */
  const getLatestSnapshot = async (
    serverId: string,
    params: IGetLatestSnapshotParams
  ): Promise<ISnapshotApiResponse<ISnapshot>> => {
    return window.api.snapshotStats.getLatest(serverId, params, user_store.getAccessToken!)
  }

  /**
   * Get summary of latest snapshots by type
   */
  const getSnapshotsSummary = async (
    serverId: string
  ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
    return window.api.snapshotStats.getSummary(serverId, user_store.getAccessToken!)
  }

  /**
   * Compare two snapshots
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
      user_store.getAccessToken!
    )
  }

  /**
   * Cleanup old snapshots
   */
  const cleanupSnapshots = async (
    serverId: string,
    params?: ICleanupSnapshotsParams
  ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
    return window.api.snapshotStats.cleanup(serverId, params, user_store.getAccessToken!)
  }

  return {
    createSnapshot,
    getAllSnapshots,
    getSnapshotById,
    getLatestSnapshot,
    getSnapshotsSummary,
    compareSnapshots,
    cleanupSnapshots
  }
}
