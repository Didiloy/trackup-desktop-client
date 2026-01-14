import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IServerMember,
    IPaginatedMembers,
    IInviteMemberRequest,
    IUpdateMemberProfileDto,
    IListMembersOptions,
    IMemberApiResponse
} from '../../../shared/contracts/interfaces/entities/member.interfaces'
import type {
    IPaginatedSessions,
    IListSessionsOptions
} from '../../../shared/contracts/interfaces/entities/session.interfaces'

/**
 * Member API Bridge
 * Exposes member-related functions to the renderer
 */
export const memberBridge = {
    /**
     * Invite a new member to the servers
     */
    invite: (
        serverId: string,
        request: IInviteMemberRequest,
        accessToken: string
    ): Promise<IMemberApiResponse<IServerMember>> => {
        return ipcRenderer.invoke(ipc_channels.member.invite, serverId, request, accessToken)
    },

    /**
     * Quit a servers (leave)
     */
    quit: (serverId: string, accessToken: string): Promise<IMemberApiResponse<void>> => {
        return ipcRenderer.invoke(ipc_channels.member.quit, serverId, accessToken)
    },

    /**
     * List servers members with optional filters and pagination
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
     * Kick a member from the servers (creator only)
     */
    kick: (
        serverId: string,
        memberId: string,
        accessToken: string
    ): Promise<IMemberApiResponse<void>> => {
        return ipcRenderer.invoke(ipc_channels.member.kick, serverId, memberId, accessToken)
    },

    /**
     * Update member profile (nickname and/or avatar)
     */
    updateProfile: (
        serverId: string,
        memberId: string,
        request: IUpdateMemberProfileDto,
        accessToken: string
    ): Promise<IMemberApiResponse<IServerMember>> => {
        return ipcRenderer.invoke(
            ipc_channels.member.updateProfile,
            serverId,
            memberId,
            request,
            accessToken
        )
    },

    /**
     * Get all sessions of a member across all activities
     */
    getSessions: (
        serverId: string,
        memberId: string,
        options: IListSessionsOptions | undefined,
        accessToken: string
    ): Promise<IMemberApiResponse<IPaginatedSessions>> => {
        return ipcRenderer.invoke(
            ipc_channels.member.getSessions,
            serverId,
            memberId,
            options,
            accessToken
        )
    },

    /**
     * Get all sessions of a member for a specific activity
     */
    getSessionsForActivity: (
        serverId: string,
        memberId: string,
        activityId: string,
        options: IListSessionsOptions | undefined,
        accessToken: string
    ): Promise<IMemberApiResponse<IPaginatedSessions>> => {
        return ipcRenderer.invoke(
            ipc_channels.member.getSessionsForActivity,
            serverId,
            memberId,
            activityId,
            options,
            accessToken
        )
    }
}

export type MemberBridge = typeof memberBridge
