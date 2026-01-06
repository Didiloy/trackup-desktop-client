import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { windowBridge } from './bridges/window.bridge'
import { appBridge } from './bridges/app.bridge'
import { authBridge } from './bridges/auth.bridge'
import { serverBridge } from './bridges/entities/server.bridge'
import { enumDefinitionBridge } from './bridges/entities/enum-definition.bridge'
import { activityBridge } from './bridges/entities/activity.bridge'
import { activitySkillLevelBridge } from './bridges/entities/activity-skill-level.bridge'
import { activityMetadataDefinitionBridge } from './bridges/entities/activity-metadata-definition.bridge'
import { sessionBridge } from './bridges/entities/session.bridge'
import { memberBridge } from './bridges/entities/member.bridge'
import { userBridge } from './bridges/entities/user.bridge'
import { serverTypeBridge } from './bridges/entities/server-type.bridge'
import { serverStatsBridge } from './bridges/entities-stats/server-stats.bridge'
import { memberStatsBridge } from './bridges/entities-stats/member-stats.bridge'
import { activityStatsBridge } from './bridges/entities-stats/activity-stats.bridge'
import { memberActivityStatsBridge } from './bridges/entities-stats/member-activity-stats.bridge'
import { enumDefinitionStatsBridge } from './bridges/entities-stats/enum-definition-stats.bridge'
import { snapshotStatsBridge } from './bridges/entities-stats/snapshot-stats.bridge'
import { billingBridge } from './bridges/billing.bridge'
import { Logger } from '../shared/logger'
import { activityMetadataDefinitionStatsBridge } from './bridges/entities-stats/activity-metadata-definition-stats.bridge'
import { userStatsBridge } from './bridges/entities-stats/user-stats.bridge'

const logger = new Logger('Preload')

/**
 * Preload script
 * Aggregates all bridges and exposes them to the renderer via contextBridge
 */

// Aggregate all API bridges
const api = {
    window: windowBridge,
    app: appBridge,
    auth: authBridge,
    server: serverBridge,
    enumDefinition: enumDefinitionBridge,
    activity: activityBridge,
    activitySkillLevel: activitySkillLevelBridge,
    activityMetadataDefinition: activityMetadataDefinitionBridge,
    session: sessionBridge,
    member: memberBridge,
    user: userBridge,
    serverType: serverTypeBridge,
    serverStats: serverStatsBridge,
    memberStats: memberStatsBridge,
    activityStats: activityStatsBridge,
    memberActivityStats: memberActivityStatsBridge,
    enumDefinitionStats: enumDefinitionStatsBridge,
    snapshotStats: snapshotStatsBridge,
    activityMetadataDefinitionStats: activityMetadataDefinitionStatsBridge,
    billing: billingBridge,
    userStats: userStatsBridge
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        logger.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
