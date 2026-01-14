import { ipcMain } from 'electron'
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
    // Invite a new member to the servers
    ipcMain.handle(
        ipc_channels.member.invite,
        async (
            _event,
            serverId: string,
            request: IInviteMemberRequest,
            accessToken: string
        ): Promise<IMemberApiResponse<IServerMember>> => {
            logger.info('Inviting member to servers:', serverId)

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

    // Quit a servers
    ipcMain.handle(
        ipc_channels.member.quit,
        async (
            _event,
            serverId: string,
            accessToken: string
        ): Promise<IMemberApiResponse<void>> => {
            logger.info('Quitting servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(`/api/v1/servers/${serverId}/members/quit`, accessToken)
        }
    )

    // List servers members with filters and pagination
    ipcMain.handle(
        ipc_channels.member.list,
        async (
            _event,
            serverId: string,
            options: IListMembersOptions | undefined,
            accessToken: string
        ): Promise<IMemberApiResponse<IPaginatedMembers>> => {
            logger.info('Listing members for servers:', serverId)

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

    // Kick a member from the servers (creator only)
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

            return apiService.delete<void>(
                `/api/v1/servers/${serverId}/members/${memberId}`,
                accessToken
            )
        }
    )

    // Update member profile (nickname and/or avatar)
    ipcMain.handle(
        ipc_channels.member.updateProfile,
        async (
            _event,
            serverId: string,
            memberId: string,
            request: IUpdateMemberProfileDto,
            accessToken: string
        ): Promise<IMemberApiResponse<IServerMember>> => {
            logger.info('Updating member profile:', memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.put<IServerMember>(
                `/api/v1/servers/${serverId}/members/${memberId}/profile`,
                accessToken,
                request
            )
        }
    )

    // Get all sessions of a member across all activities
    ipcMain.handle(
        ipc_channels.member.getSessions,
        async (
            _event,
            serverId: string,
            memberId: string,
            options: IListSessionsOptions | undefined,
            accessToken: string
        ): Promise<IMemberApiResponse<IPaginatedSessions>> => {
            logger.info('Getting sessions for member:', memberId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IPaginatedSessions>(
                `/api/v1/servers/${serverId}/members/${memberId}/sessions`,
                accessToken,
                buildRequestOptions(options)
            )
        }
    )

    // Get all sessions of a member for a specific activity
    ipcMain.handle(
        ipc_channels.member.getSessionsForActivity,
        async (
            _event,
            serverId: string,
            memberId: string,
            activityId: string,
            options: IListSessionsOptions | undefined,
            accessToken: string
        ): Promise<IMemberApiResponse<IPaginatedSessions>> => {
            logger.info('Getting sessions for member and activity:', memberId, activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(memberId, 'Member ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IPaginatedSessions>(
                `/api/v1/servers/${serverId}/members/${memberId}/activities/${activityId}/sessions`,
                accessToken,
                buildRequestOptions(options)
            )
        }
    )

    logger.info('Member IPC handlers registered')
}
