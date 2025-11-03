/**
 * IPC Channel Constants
 * Centralized location for all IPC channel names
 */

import { WINDOW_CHANNELS } from './types/window'
import { AUTH_CHANNELS } from './types/auth'
import { APP_CHANNELS } from './types/app'
import { SERVER_CHANNELS } from './types/server'
import { ENUM_DEFINITION_CHANNELS } from './types/enum-definition'
import { ACTIVITY_CHANNELS } from './types/activity'
import { ACTIVITY_SKILL_LEVEL_CHANNELS } from './types/activity-skill-level'
import { SESSION_CHANNELS } from './types/session'
import { MEMBER_CHANNELS } from './types/member'
import { USER_CHANNELS } from './types/user'
import { SERVER_TYPE_CHANNELS } from './types/server-type'
import { SERVER_STATS_CHANNELS } from './types/server-stats'
import { MEMBER_STATS_CHANNELS } from './types/member-stats'
import { ACTIVITY_STATS_CHANNELS } from './types/activity-stats'
import { MEMBER_ACTIVITY_STATS_CHANNELS } from './types/member-activity-stats'
import { ENUM_DEFINITION_STATS_CHANNELS } from './types/enum-definition-stats'
import { SNAPSHOT_STATS_CHANNELS } from './types/snapshot-stats'

export const ipc_channels = {
  window: WINDOW_CHANNELS,
  auth: AUTH_CHANNELS,
  app: APP_CHANNELS,
  server: SERVER_CHANNELS,
  enumDefinition: ENUM_DEFINITION_CHANNELS,
  activity: ACTIVITY_CHANNELS,
  activitySkillLevel: ACTIVITY_SKILL_LEVEL_CHANNELS,
  session: SESSION_CHANNELS,
  member: MEMBER_CHANNELS,
  user: USER_CHANNELS,
  serverType: SERVER_TYPE_CHANNELS,
  serverStats: SERVER_STATS_CHANNELS,
  memberStats: MEMBER_STATS_CHANNELS,
  activityStats: ACTIVITY_STATS_CHANNELS,
  memberActivityStats: MEMBER_ACTIVITY_STATS_CHANNELS,
  enumDefinitionStats: ENUM_DEFINITION_STATS_CHANNELS,
  snapshotStats: SNAPSHOT_STATS_CHANNELS
} as const
