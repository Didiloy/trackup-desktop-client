/**
 * Server Member related interfaces
 */

export interface IServerMember {
  public_id: string
  user_email: string
  nickname: string
  role_public_id: string
  role_name: string
  created_at: string
}

export interface IInviteMemberRequest {
  user_id: string
}

export interface IUpdateNicknameRequest {
  nickname: string
}

export interface IPaginatedMembers {
  total: number
  page: number
  limit: number
  pageCount: number
  data: IServerMember[]
}

export interface IListMembersOptions {
  page?: number
  limit?: number
  search?: string
  nickname?: string
  role_public_id?: string
}

export interface IMemberApiResponse<T = unknown> {
  data?: T
  error?: string
}
