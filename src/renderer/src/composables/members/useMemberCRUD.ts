import { useUserStore } from '@/stores/user'
import type {
  IServerMember,
  IPaginatedMembers,
  IInviteMemberRequest,
  IUpdateNicknameRequest,
  IListMembersOptions,
  IMemberApiResponse
} from '../../../../shared/contracts/interfaces/entities/member.interfaces'

interface UseMemberCRUDReturn {
  inviteMember: (
    serverId: string,
    request: IInviteMemberRequest
  ) => Promise<IMemberApiResponse<IServerMember>>
  quitServer: (serverId: string) => Promise<IMemberApiResponse<void>>
  listMembers: (
    serverId: string,
    options?: IListMembersOptions
  ) => Promise<IMemberApiResponse<IPaginatedMembers>>
  getMemberById: (
    serverId: string,
    memberId: string
  ) => Promise<IMemberApiResponse<IServerMember>>
  kickMember: (serverId: string, memberId: string) => Promise<IMemberApiResponse<void>>
  updateMemberNickname: (
    serverId: string,
    memberId: string,
    request: IUpdateNicknameRequest
  ) => Promise<IMemberApiResponse<IServerMember>>
}

/**
 * Composable for Member entity operations
 * Each method is independent and contains all necessary parameters
 */
export function useMemberCRUD(): UseMemberCRUDReturn {
  const user_store = useUserStore()

  /**
   * Invite a new member to the servers
   */
  const inviteMember = async (
    serverId: string,
    request: IInviteMemberRequest
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return window.api.member.invite(serverId, request, user_store.getAccessToken!)
  }

  /**
   * Quit a servers
   */
  const quitServer = async (serverId: string): Promise<IMemberApiResponse<void>> => {
    return window.api.member.quit(serverId, user_store.getAccessToken!)
  }

  /**
   * List servers members with filters and pagination
   */
  const listMembers = async (
    serverId: string,
    options?: IListMembersOptions
  ): Promise<IMemberApiResponse<IPaginatedMembers>> => {
    return window.api.member.list(serverId, options, user_store.getAccessToken!)
  }

  /**
   * Get member by ID
   */
  const getMemberById = async (
    serverId: string,
    memberId: string
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return window.api.member.getById(serverId, memberId, user_store.getAccessToken!)
  }

  /**
   * Kick a member from the servers (creator only)
   */
  const kickMember = async (
    serverId: string,
    memberId: string
  ): Promise<IMemberApiResponse<void>> => {
    return window.api.member.kick(serverId, memberId, user_store.getAccessToken!)
  }

  /**
   * Update member nickname
   */
  const updateMemberNickname = async (
    serverId: string,
    memberId: string,
    request: IUpdateNicknameRequest
  ): Promise<IMemberApiResponse<IServerMember>> => {
    return window.api.member.updateNickname(serverId, memberId, request, user_store.getAccessToken!)
  }

  return {
    inviteMember,
    quitServer,
    listMembers,
    getMemberById,
    kickMember,
    updateMemberNickname
  }
}
