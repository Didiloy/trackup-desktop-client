import { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowBridge } from './bridges/window.bridge'
import type { AppBridge } from './bridges/app.bridge'
import type { AuthBridge } from './bridges/auth.bridge'
import type { ServerBridge } from './bridges/entities/server.bridge'
import type { EnumDefinitionBridge } from './bridges/entities/enum-definition.bridge'
import type { ActivityBridge } from './bridges/entities/activity.bridge'
import type { ActivitySkillLevelBridge } from './bridges/entities/activity-skill-level.bridge'
import type { SessionBridge } from './bridges/entities/session.bridge'
import type { MemberBridge } from './bridges/entities/member.bridge'
import type { UserBridge } from './bridges/entities/user.bridge'
import type { ServerTypeBridge } from './bridges/entities/server-type.bridge'
import type { ServerStatsBridge } from './bridges/entities-stats/server-stats.bridge'
import type { MemberStatsBridge } from './bridges/entities-stats/member-stats.bridge'
import type { ActivityStatsBridge } from './bridges/entities-stats/activity-stats.bridge'
import type { MemberActivityStatsBridge } from './bridges/entities-stats/member-activity-stats.bridge'
import type { EnumDefinitionStatsBridge } from './bridges/entities-stats/enum-definition-stats.bridge'
import type { SnapshotStatsBridge } from './bridges/entities-stats/snapshot-stats.bridge'
import type { BillingBridge } from './bridges/billing.bridge'

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
    memberActivityStats: MemberActivityStatsBridge
    enumDefinitionStats: EnumDefinitionStatsBridge
    snapshotStats: SnapshotStatsBridge
    billing: BillingBridge
}

declare global {
    interface Window {
        electron: ElectronAPI
        api: API
    }
}
