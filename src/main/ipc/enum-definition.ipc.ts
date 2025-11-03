import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IEnumDefinition,
  ICreateEnumDefinitionRequest,
  IUpdateEnumDefinitionRequest,
  IEnumDefinitionApiResponse
} from '../../shared/contracts/interfaces/enum-definition.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

const logger = new Logger('IPC:EnumDefinition')

/**
 * Register enum definition-related IPC handlers
 */
export function registerEnumDefinitionIpc(): void {
  // Create a new enum definition
  ipcMain.handle(
    ipc_channels.enumDefinition.create,
    async (
      _event,
      serverId: string,
      request: ICreateEnumDefinitionRequest,
      accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
      logger.info('Creating enum definition:', request.name)

      // Validate input
      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!request.name) {
        return { error: 'Name is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IEnumDefinition>(
        `/api/v1/servers/${serverId}/enum-definitions`,
        accessToken,
        request
      )
    }
  )

  // List all enum definitions in a server
  ipcMain.handle(
    ipc_channels.enumDefinition.list,
    async (
      _event,
      serverId: string,
      accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition[]>> => {
      logger.info('Listing enum definitions for server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IEnumDefinition[]>(
        `/api/v1/servers/${serverId}/enum-definitions`,
        accessToken
      )
    }
  )

  // Update an enum definition
  ipcMain.handle(
    ipc_channels.enumDefinition.update,
    async (
      _event,
      serverId: string,
      enumDefinitionId: string,
      request: IUpdateEnumDefinitionRequest,
      accessToken: string
    ): Promise<IEnumDefinitionApiResponse<IEnumDefinition>> => {
      logger.info('Updating enum definition:', enumDefinitionId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!enumDefinitionId) {
        return { error: 'Enum definition ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.put<IEnumDefinition>(
        `/api/v1/servers/${serverId}/enum-definitions/${enumDefinitionId}`,
        accessToken,
        request
      )
    }
  )

  // Delete an enum definition
  ipcMain.handle(
    ipc_channels.enumDefinition.delete,
    async (
      _event,
      serverId: string,
      enumDefinitionId: string,
      accessToken: string
    ): Promise<IEnumDefinitionApiResponse<void>> => {
      logger.info('Deleting enum definition:', enumDefinitionId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!enumDefinitionId) {
        return { error: 'Enum definition ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/enum-definitions/${enumDefinitionId}`,
        accessToken
      )
    }
  )

  logger.info('Enum definition IPC handlers registered')
}
