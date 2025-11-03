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
  serverType: SERVER_TYPE_CHANNELS
} as const
