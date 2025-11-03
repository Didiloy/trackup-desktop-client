import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IServerMember,
  IPaginatedMembers,
  IInviteMemberRequest,
  IUpdateNicknameRequest,
  IListMembersOptions,
  IMemberApiResponse
} from '../../shared/contracts/interfaces/member.interfaces'

/**
 * Member API Bridge
 * Exposes member-related functions to the renderer
 */
export const memberBridge = {
  /**
   * Invite a new member to the server
   */
  invite: (
    serverId: string,
    request: IInviteMemberRequest,
    accessToken: string
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return ipcRenderer.invoke(ipc_channels.member.invite, serverId, request, accessToken)
  },

  /**
   * Quit a server (leave)
   */
  quit: (serverId: string, accessToken: string): Promise<IMemberApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.member.quit, serverId, accessToken)
  },

  /**
   * List server members with optional filters and pagination
   */
  list: (
    serverId: string,
    options: IListMembersOptions | undefined,
    accessToken: string
  ): Promise<IMemberApiResponse<IPaginatedMembers>> => {
    return ipcRenderer.invoke(ipc_channels.member.list, serverId, options, accessToken)
  },

  /**
   * Get details of a specific member
   */
  getById: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return ipcRenderer.invoke(ipc_channels.member.getById, serverId, memberId, accessToken)
  },

  /**
   * Kick a member from the server (creator only)
   */
  kick: (
    serverId: string,
    memberId: string,
    accessToken: string
  ): Promise<IMemberApiResponse<void>> => {
    return ipcRenderer.invoke(ipc_channels.member.kick, serverId, memberId, accessToken)
  },

  /**
   * Update member nickname
   */
  updateNickname: (
    serverId: string,
    memberId: string,
    request: IUpdateNicknameRequest,
    accessToken: string
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return ipcRenderer.invoke(
      ipc_channels.member.updateNickname,
      serverId,
      memberId,
      request,
      accessToken
    )
  }
}

export type MemberBridge = typeof memberBridge
