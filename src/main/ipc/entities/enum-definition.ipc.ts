import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IEnumDefinition,
  ICreateEnumDefinitionRequest,
  IUpdateEnumDefinitionRequest,
  IEnumDefinitionApiResponse
} from '../../../shared/contracts/interfaces/entities/enum-definition.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import { validateRequired, validateAuth, combineValidations } from '../../../shared/helpers/index.helpers'

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
      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(request.name, 'Name'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(enumDefinitionId, 'Enum definition ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(enumDefinitionId, 'Enum definition ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.delete<void>(
        `/api/v1/servers/${serverId}/enum-definitions/${enumDefinitionId}`,
        accessToken
      )
    }
  )

  logger.info('Enum definition IPC handlers registered')
}
