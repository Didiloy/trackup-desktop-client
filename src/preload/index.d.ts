import { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowBridge } from './bridges/window.bridge'
import type { AppBridge } from './bridges/app.bridge'
import type { AuthBridge } from './bridges/auth.bridge'
import type { ServerBridge } from './bridges/server.bridge'
import type { EnumDefinitionBridge } from './bridges/enum-definition.bridge'
import type { ActivityBridge } from './bridges/activity.bridge'
import type { ActivitySkillLevelBridge } from './bridges/activity-skill-level.bridge'
import type { SessionBridge } from './bridges/session.bridge'
import type { MemberBridge } from './bridges/member.bridge'
import type { UserBridge } from './bridges/user.bridge'
import type { ServerTypeBridge } from './bridges/server-type.bridge'
import type { ServerStatsBridge } from './bridges/server-stats.bridge'
import type { MemberStatsBridge } from './bridges/member-stats.bridge'
import type { ActivityStatsBridge } from './bridges/activity-stats.bridge'

/**
 * Global type definitions for window.api
 */
export interface API {
  window: WindowBridge
  app: AppBridge
  auth: AuthBridge
  server: ServerBridge
  enumDefinition: EnumDefinitionBridge
  activity: ActivityBridge
  activitySkillLevel: ActivitySkillLevelBridge
  session: SessionBridge
  member: MemberBridge
  user: UserBridge
  serverType: ServerTypeBridge
  serverStats: ServerStatsBridge
  memberStats: MemberStatsBridge
  activityStats: ActivityStatsBridge
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
