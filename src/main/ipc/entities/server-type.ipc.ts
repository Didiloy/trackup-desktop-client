import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IServerType,
  IServerTypeApiResponse
} from '../../../shared/contracts/interfaces/entities/server-type.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import { validateAuth } from '../../../shared/helpers'

const logger = new Logger('IPC:ServerType')

/**
 * Register server-type-related IPC handlers
 */
export function registerServerTypeIpc(): void {
  // Get all server types
  ipcMain.handle(
    ipc_channels.serverType.getAll,
    async (_event, accessToken: string): Promise<IServerTypeApiResponse<IServerType[]>> => {
      logger.info('Getting all server types')

      const validationError = validateAuth(accessToken)
      if (validationError) return validationError

      return apiService.get<IServerType[]>('/api/v1/server-type', accessToken)
    }
  )

  logger.info('Server type IPC handlers registered')
}
