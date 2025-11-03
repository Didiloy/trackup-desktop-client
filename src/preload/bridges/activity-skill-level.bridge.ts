import { ipcRenderer } from 'electron'
import { ipc_channels } from '../../shared/contracts/ipc-channels'
import type {
  IActivitySkillLevel,
  ICreateActivitySkillLevelRequest,
  IUpdateActivitySkillLevelRequest,
  IActivitySkillLevelApiResponse
} from '../../shared/contracts/interfaces/activity-skill-level.interfaces'

/**
 * Activity Skill Level API Bridge
 * Exposes activity skill level-related functions to the renderer
 */
export const activitySkillLevelBridge = {
  /**
   * Create a new skill level for an activity
   */
  create: (
    serverId: string,
    activityId: string,
    request: ICreateActivitySkillLevelRequest,
    accessToken: string
  ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
    return ipcRenderer.invoke(
      ipc_channels.activitySkillLevel.create,
      serverId,
      activityId,
      request,
      accessToken
    )
  },

  /**
   * List all skill levels for an activity
   */
  list: (
    serverId: string,
    activityId: string,
    accessToken: string
  ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel[]>> => {
    return ipcRenderer.invoke(
      ipc_channels.activitySkillLevel.list,
      serverId,
      activityId,
      accessToken
    )
  },

  /**
   * Get details of a specific skill level
   */
  getById: (
    serverId: string,
    activityId: string,
    skillLevelId: string,
    accessToken: string
  ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
    return ipcRenderer.invoke(
      ipc_channels.activitySkillLevel.getById,
      serverId,
      activityId,
      skillLevelId,
      accessToken
    )
  },

  /**
   * Update a skill level (creator only)
   */
  update: (
    serverId: string,
    activityId: string,
    skillLevelId: string,
    request: IUpdateActivitySkillLevelRequest,
    accessToken: string
  ): Promise<IActivitySkillLevelApiResponse<IActivitySkillLevel>> => {
    return ipcRenderer.invoke(
      ipc_channels.activitySkillLevel.update,
      serverId,
      activityId,
      skillLevelId,
      request,
      accessToken
    )
  },

  /**
   * Delete a skill level (creator only)
   */
  delete: (
    serverId: string,
    activityId: string,
    skillLevelId: string,
    accessToken: string
  ): Promise<IActivitySkillLevelApiResponse<void>> => {
    return ipcRenderer.invoke(
      ipc_channels.activitySkillLevel.delete,
      serverId,
      activityId,
      skillLevelId,
      accessToken
    )
  }
}

export type ActivitySkillLevelBridge = typeof activitySkillLevelBridge
