import { ipcMain } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IServerMember,
  IPaginatedMembers,
  IInviteMemberRequest,
  IUpdateNicknameRequest,
  IListMembersOptions,
  IMemberApiResponse
} from '../../shared/contracts/interfaces/member.interfaces'
import { Logger } from '../../shared/logger'
import { apiService } from '../services/ApiService'

const logger = new Logger('IPC:Member')

/**
 * Register member-related IPC handlers
 */
export function registerMemberIpc(): void {
  // Invite a new member to the server
  ipcMain.handle(
    ipc_channels.member.invite,
    async (
      _event,
      serverId: string,
      request: IInviteMemberRequest,
      accessToken: string
    ): Promise<IMemberApiResponse<IServerMember>> => {
      logger.info('Inviting member to server:', serverId)

      // Validate input
      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!request.user_id) {
        return { error: 'User ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.post<IServerMember>(
        `/api/v1/servers/${serverId}/members/invite`,
        accessToken,
        request
      )
    }
  )

  // Quit a server
  ipcMain.handle(
    ipc_channels.member.quit,
    async (_event, serverId: string, accessToken: string): Promise<IMemberApiResponse<void>> => {
      logger.info('Quitting server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(`/api/v1/servers/${serverId}/members/quit`, accessToken)
    }
  )

  // List server members with filters and pagination
  ipcMain.handle(
    ipc_channels.member.list,
    async (
      _event,
      serverId: string,
      options: IListMembersOptions | undefined,
      accessToken: string
    ): Promise<IMemberApiResponse<IPaginatedMembers>> => {
      logger.info('Listing members for server:', serverId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      // Build query parameters
      const params: Record<string, string | number> = {}
      if (options?.page) {
        params.page = options.page
      }
      if (options?.limit) {
        params.limit = options.limit
      }
      if (options?.search) {
        params.search = options.search
      }
      if (options?.nickname) {
        params.nickname = options.nickname
      }
      if (options?.role_public_id) {
        params.role_public_id = options.role_public_id
      }

      return apiService.get<IPaginatedMembers>(`/api/v1/servers/${serverId}/members`, accessToken, {
        params: Object.keys(params).length > 0 ? params : undefined
      })
    }
  )

  // Get member by ID
  ipcMain.handle(
    ipc_channels.member.getById,
    async (
      _event,
      serverId: string,
      memberId: string,
      accessToken: string
    ): Promise<IMemberApiResponse<IServerMember>> => {
      logger.info('Getting member details:', memberId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.get<IServerMember>(
        `/api/v1/servers/${serverId}/members/${memberId}`,
        accessToken
      )
    }
  )

  // Kick a member from the server (creator only)
  ipcMain.handle(
    ipc_channels.member.kick,
    async (
      _event,
      serverId: string,
      memberId: string,
      accessToken: string
    ): Promise<IMemberApiResponse<void>> => {
      logger.info('Kicking member:', memberId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.delete<void>(`/api/v1/servers/${serverId}/members/${memberId}`, accessToken)
    }
  )

  // Update member nickname
  ipcMain.handle(
    ipc_channels.member.updateNickname,
    async (
      _event,
      serverId: string,
      memberId: string,
      request: IUpdateNicknameRequest,
      accessToken: string
    ): Promise<IMemberApiResponse<IServerMember>> => {
      logger.info('Updating member nickname:', memberId)

      if (!serverId) {
        return { error: 'Server ID is required' }
      }

      if (!memberId) {
        return { error: 'Member ID is required' }
      }

      if (!request.nickname) {
        return { error: 'Nickname is required' }
      }

      if (!accessToken) {
        return { error: 'Authentication required' }
      }

      return apiService.patch<IServerMember>(
        `/api/v1/servers/${serverId}/members/${memberId}/nickname`,
        accessToken,
        request
      )
    }
  )

  logger.info('Member IPC handlers registered')
}
