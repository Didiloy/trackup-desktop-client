/**
 * Enum Definition Statistics IPC Handlers
 * Handles enum definition statistics and value distribution
 */

import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IEnumValueDistribution,
  IPaginatedEnumDefinitionStats,
  IPaginatedEnumValueStats,
  IEnumDefinitionPaginationParams,
  IEnumDefinitionDetailsParams,
  IEnumValueDetailsParams,
  IEnumDefinitionStatsApiResponse
} from '../../../shared/contracts/interfaces/entities-stats/enum-definition-stats.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
  buildQueryParams,
  combineValidations,
  validateAuth,
  validatePagination,
  validateRequired
} from '../../../shared/helpers/index.helpers'

const logger = new Logger('IPC:EnumDefinitionStats')

export function registerEnumDefinitionStatsIpc(): void {
  // Get all enum definitions statistics (paginated)
  ipcMain.handle(
    ipc_channels.enumDefinitionStats.getAllStats,
    async (
      _event,
      serverId: string,
      params: IEnumDefinitionPaginationParams,
      accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumDefinitionStats>> => {
      logger.info('Getting all enum definitions stats:', serverId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validatePagination(params.page, params.limit),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IPaginatedEnumDefinitionStats>(
        `/api/v1/stats/servers/${serverId}/enums_definitions${queryString}`,
        accessToken
      )
    }
  )

  // Get enum definition statistics (paginated values)
  ipcMain.handle(
    ipc_channels.enumDefinitionStats.getStats,
    async (
      _event,
      serverId: string,
      enumDefinitionId: string,
      params: IEnumDefinitionDetailsParams,
      accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
      logger.info('Getting enum definition stats:', serverId, enumDefinitionId, params)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(enumDefinitionId, 'Enum Definition ID'),
        validatePagination(params.page, params.limit),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IPaginatedEnumValueStats>(
        `/api/v1/stats/servers/${serverId}/enums_definitions/${enumDefinitionId}${queryString}`,
        accessToken
      )
    }
  )

  // Get enum value distribution
  ipcMain.handle(
    ipc_channels.enumDefinitionStats.getDistribution,
    async (
      _event,
      serverId: string,
      enumDefinitionId: string,
      accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IEnumValueDistribution>> => {
      logger.info('Getting enum value distribution:', serverId, enumDefinitionId)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(enumDefinitionId, 'Enum Definition ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.get<IEnumValueDistribution>(
        `/api/v1/stats/servers/${serverId}/enums_definitions/${enumDefinitionId}/distribution`,
        accessToken
      )
    }
  )

  // Get enum value statistics (paginated)
  ipcMain.handle(
    ipc_channels.enumDefinitionStats.getValueStats,
    async (
      _event,
      serverId: string,
      enumDefinitionId: string,
      enumValueId: string,
      params: IEnumValueDetailsParams,
      accessToken: string
    ): Promise<IEnumDefinitionStatsApiResponse<IPaginatedEnumValueStats>> => {
      logger.info('Getting enum value stats:', serverId, enumDefinitionId, enumValueId, params)

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(enumDefinitionId, 'Enum Definition ID'),
        validateRequired(enumValueId, 'Enum Value ID'),
        validatePagination(params.page, params.limit),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      const queryString = buildQueryParams(params)

      return apiService.get<IPaginatedEnumValueStats>(
        `/api/v1/stats/servers/${serverId}/enums_definitions/${enumDefinitionId}/values/${enumValueId}${queryString}`,
        accessToken
      )
    }
  )

  logger.info('Enum definition stats IPC handlers registered')
}
