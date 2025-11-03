import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
  IServerMember,
  IPaginatedMembers,
  IInviteMemberRequest,
  IUpdateNicknameRequest,
  IListMembersOptions,
  IMemberApiResponse
} from '../../../shared/contracts/interfaces/entities/member.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
  validateRequired,
  validateAuth,
  combineValidations,
  buildRequestOptions
} from '../../../shared/helpers/index.helpers'

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
      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(request.user_id, 'User ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.get<IPaginatedMembers>(
        `/api/v1/servers/${serverId}/members`,
        accessToken,
        buildRequestOptions(options)
      )
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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

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

      const validationError = combineValidations(
        validateRequired(serverId, 'Server ID'),
        validateRequired(memberId, 'Member ID'),
        validateRequired(request.nickname, 'Nickname'),
        validateAuth(accessToken)
      )
      if (validationError) return validationError

      return apiService.patch<IServerMember>(
        `/api/v1/servers/${serverId}/members/${memberId}/nickname`,
        accessToken,
        request
      )
    }
  )

  logger.info('Member IPC handlers registered')
}
