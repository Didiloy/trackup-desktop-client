import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IServerType,
  IServerTypeApiResponse
} from '../../shared/contracts/interfaces/server-type.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

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

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IServerType[]>('/api/v1/server-type', accessToken)
    }
  )

  logger.info('Server type IPC handlers registered')
}

