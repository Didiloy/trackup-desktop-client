import { ipcMain } from 'electron'
import { ipc_channels } from '../../../shared/contracts/ipc-channels/index.channels'
import type {
    IActivity,
    ICreateActivityRequest,
    IUpdateActivityRequest,
    IListActivitiesOptions,
    IActivityApiResponse,
    IPaginatedActivities,
    ICreateActivitySessionRequest,
    IPaginatedActivitySessions
} from '../../../shared/contracts/interfaces/entities/activity.interfaces'
import { Logger } from '../../../shared/logger'
import { apiService } from '../../services/ApiService'
import {
    validateRequired,
    validateAuth,
    combineValidations,
    buildRequestOptions
} from '../../../shared/helpers/index.helpers'
import type {
    IListSessionsOptions,
    ISession
} from '../../../shared/contracts/interfaces/entities/session.interfaces'

const logger = new Logger('IPC:Activity')

/**
 * Register activity-related IPC handlers
 */
export function registerActivityIpc(): void {
    // Create a new activity
    ipcMain.handle(
        ipc_channels.activity.create,
        async (
            _event,
            serverId: string,
            request: ICreateActivityRequest,
            accessToken: string
        ): Promise<IActivityApiResponse<IActivity>> => {
            logger.info('Creating activity:', request.name)

            // Validate input
            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(request.name, 'Activity name'),
                validateAuth(accessToken)
            )
            console.log('validationError', validationError)
            if (validationError) return validationError

            return apiService.post<IActivity>(
                `/api/v1/servers/${serverId}/activities`,
                accessToken,
                request
            )
        }
    )

    // List all activities in a servers
    ipcMain.handle(
        ipc_channels.activity.list,
        async (
            _event,
            serverId: string,
            options: IListActivitiesOptions | undefined,
            accessToken: string
        ): Promise<IActivityApiResponse<IPaginatedActivities>> => {
            logger.info('Listing activities for servers:', serverId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IPaginatedActivities>(
                `/api/v1/servers/${serverId}/activities`,
                accessToken,
                buildRequestOptions(options)
            )
        }
    )

    // Get activity by ID
    ipcMain.handle(
        ipc_channels.activity.getById,
        async (
            _event,
            serverId: string,
            activityId: string,
            accessToken: string
        ): Promise<IActivityApiResponse<IActivity>> => {
            logger.info('Getting activity details:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IActivity>(
                `/api/v1/servers/${serverId}/activities/${activityId}`,
                accessToken
            )
        }
    )

    // Update an activity
    ipcMain.handle(
        ipc_channels.activity.update,
        async (
            _event,
            serverId: string,
            activityId: string,
            request: IUpdateActivityRequest,
            accessToken: string
        ): Promise<IActivityApiResponse<IActivity>> => {
            logger.info('Updating activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(request.name, 'Activity name'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.put<IActivity>(
                `/api/v1/servers/${serverId}/activities/${activityId}`,
                accessToken,
                request
            )
        }
    )

    // Delete an activity
    ipcMain.handle(
        ipc_channels.activity.delete,
        async (
            _event,
            serverId: string,
            activityId: string,
            accessToken: string
        ): Promise<IActivityApiResponse<void>> => {
            logger.info('Deleting activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.delete<void>(
                `/api/v1/servers/${serverId}/activities/${activityId}`,
                accessToken
            )
        }
    )

    // Create a new session for an activity (RESTful route)
    ipcMain.handle(
        ipc_channels.activity.createSession,
        async (
            _event,
            serverId: string,
            activityId: string,
            request: ICreateActivitySessionRequest,
            accessToken: string
        ): Promise<IActivityApiResponse<ISession>> => {
            logger.info('Creating session for activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateRequired(request.duration, 'Duration'),
                validateRequired(request.date, 'Date'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.post<ISession>(
                `/api/v1/servers/${serverId}/activities/${activityId}/sessions`,
                accessToken,
                request
            )
        }
    )

    // List paginated sessions for a specific activity
    ipcMain.handle(
        ipc_channels.activity.listSessions,
        async (
            _event,
            serverId: string,
            activityId: string,
            options: IListSessionsOptions | undefined,
            accessToken: string
        ): Promise<IActivityApiResponse<IPaginatedActivitySessions>> => {
            logger.info('Listing sessions for activity:', activityId)

            const validationError = combineValidations(
                validateRequired(serverId, 'Server ID'),
                validateRequired(activityId, 'Activity ID'),
                validateAuth(accessToken)
            )
            if (validationError) return validationError

            return apiService.get<IPaginatedActivitySessions>(
                `/api/v1/servers/${serverId}/activities/${activityId}/sessions`,
                accessToken,
                buildRequestOptions(options)
            )
        }
    )

    logger.info('Activity IPC handlers registered')
}
