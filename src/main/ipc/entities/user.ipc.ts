import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IUser,
  IUserServer,
  IUserApiResponse
} from '../../../shared/contracts/interfaces/entities/user.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'

const logger = new Logger('IPC:User')

/**
 * Register user-related IPC handlers
 */
export function registerUserIpc(): void {
  // Get current user information
  ipcMain.handle(
    ipc_channels.user.getMe,
    async (_event, accessToken: string): Promise<IUserApiResponse<IUser>> => {
      logger.info('Getting current user information')

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IUser>('/api/v1/users/me', accessToken)
    }
  )

  // Get current user's servers
  ipcMain.handle(
    ipc_channels.user.getMyServers,
    async (_event, accessToken: string): Promise<IUserApiResponse<IUserServer[]>> => {
      logger.info('Getting current user servers')

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IUserServer[]>('/api/v1/users/me/servers', accessToken)
    }
  )

  logger.info('User IPC handlers registered')
}
