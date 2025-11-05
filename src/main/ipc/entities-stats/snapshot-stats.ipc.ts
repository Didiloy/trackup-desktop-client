/**
 * Snapshot Statistics IPC Handlers
 * Handles servers statistics snapshots and comparisons
 */

import { ipcMain } from 'electron'
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
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
  buildQueryParams,
  combineValidations,
  validateAuth,
  validatePagination,
  validateRequired
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:SnapshotStats')

export function registerSnapshotStatsIpc(): void {
  // Create a manual snapshot
  ipcMain.handle(
    ipc_channels.snapshotStats.create,
    async (
      _event,
      serverId: string,
      request: ICreateSnapshotRequest,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
      logger.info('Creating snapshot:', serverId, request.type)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(request.type, 'Snapshot type'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.post<ISnapshot>(
        `/api/v1/stats/servers/${serverId}/snapshots`,
        accessToken,
        request
      )
    }
  )

  // Get all snapshots (paginated)
  ipcMain.handle(
    ipc_channels.snapshotStats.getAll,
    async (
      _event,
      serverId: string,
      params: IGetSnapshotsParams,
      accessToken: string
    ): Promise<ISnapshotApiResponse<IPaginatedSnapshots>> => {
      logger.info('Getting all snapshots:', serverId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validatePagination(params.page, params.limit),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IPaginatedSnapshots>(
        `/api/v1/stats/servers/${serverId}/snapshots${queryString}`,
        accessToken
      )
    }
  )

  // Get a specific snapshot
  ipcMain.handle(
    ipc_channels.snapshotStats.getById,
    async (
      _event,
      serverId: string,
      snapshotId: string,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
      logger.info('Getting snapshot:', serverId, snapshotId)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(snapshotId, 'Snapshot ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.get<ISnapshot>(
        `/api/v1/stats/servers/${serverId}/snapshots/${snapshotId}`,
        accessToken
      )
    }
  )

  // Get the latest snapshot by type
  ipcMain.handle(
    ipc_channels.snapshotStats.getLatest,
    async (
      _event,
      serverId: string,
      params: IGetLatestSnapshotParams,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshot>> => {
      logger.info('Getting latest snapshot:', serverId, params.type)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(params.type, 'Snapshot type'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<ISnapshot>(
        `/api/v1/stats/servers/${serverId}/snapshots/latest${queryString}`,
        accessToken
      )
    }
  )

  // Get summary of latest snapshots by type
  ipcMain.handle(
    ipc_channels.snapshotStats.getSummary,
    async (
      _event,
      serverId: string,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshotSummary>> => {
      logger.info('Getting snapshots summary:', serverId)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.get<ISnapshotSummary>(
        `/api/v1/stats/servers/${serverId}/snapshots/summary`,
        accessToken
      )
    }
  )

  // Compare two snapshots
  ipcMain.handle(
    ipc_channels.snapshotStats.compare,
    async (
      _event,
      serverId: string,
      snapshotId1: string,
      snapshotId2: string,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ISnapshotComparisonResult>> => {
      logger.info('Comparing snapshots:', serverId, snapshotId1, snapshotId2)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(snapshotId1, 'First Snapshot ID'),
        validateRequired(snapshotId2, 'Second Snapshot ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError
      return apiService.get<ISnapshotComparisonResult>(
        `/api/v1/stats/servers/${serverId}/snapshots/${snapshotId1}/compare/${snapshotId2}`,
        accessToken
      )
    }
  )

  // Cleanup old snapshots
  ipcMain.handle(
    ipc_channels.snapshotStats.cleanup,
    async (
      _event,
      serverId: string,
      params: ICleanupSnapshotsParams | undefined,
      accessToken: string
    ): Promise<ISnapshotApiResponse<ICleanupSnapshotsResponse>> => {
      logger.info('Cleaning up snapshots:', serverId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.delete<ICleanupSnapshotsResponse>(
        `/api/v1/stats/servers/${serverId}/snapshots/cleanup${queryString}`,
        accessToken
      )
    }
  )

  logger.info('Snapshot stats IPC handlers registered')
}
