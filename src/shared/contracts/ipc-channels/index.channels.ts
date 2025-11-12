/**
 * IPC Channel Constants
 * Centralized location for all IPC channel names
 */

import { WINDOW_CHANNELS } from './types/window.channels'
import { AUTH_CHANNELS } from './types/auth.channels'
import { APP_CHANNELS } from './types/app.channels'
import { SERVER_CHANNELS } from './types/entities/server.channels'
import { ENUM_DEFINITION_CHANNELS } from './types/entities/enum-definition.channels'
import { ACTIVITY_CHANNELS } from './types/entities/activity.channels'
import { ACTIVITY_SKILL_LEVEL_CHANNELS } from './types/entities/activity-skill-level.channels'
import { SESSION_CHANNELS } from './types/entities/session.channels'
import { MEMBER_CHANNELS } from './types/entities/member.channels'
import { USER_CHANNELS } from './types/entities/user.channels'
import { SERVER_TYPE_CHANNELS } from './types/entities/server-type.channels'
import { SERVER_STATS_CHANNELS } from './types/entities-stats/server-stats.channels'
import { MEMBER_STATS_CHANNELS } from './types/entities-stats/member-stats.channels'
import { ACTIVITY_STATS_CHANNELS } from './types/entities-stats/activity-stats.channels'
import { MEMBER_ACTIVITY_STATS_CHANNELS } from './types/entities-stats/member-activity-stats.channels'
import { ENUM_DEFINITION_STATS_CHANNELS } from './types/entities-stats/enum-definition-stats.channels'
import { SNAPSHOT_STATS_CHANNELS } from './types/entities-stats/snapshot-stats.channels'
import { BILLING_CHANNELS } from './types/billing.channels'

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
    snapshotStats: SNAPSHOT_STATS_CHANNELS,
    billing: BILLING_CHANNELS
} as const
