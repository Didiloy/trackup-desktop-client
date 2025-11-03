import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { windowBridge } from './bridges/window.bridge'
import { appBridge } from './bridges/app.bridge'
import { authBridge } from './bridges/auth.bridge'
import { serverBridge } from './bridges/server.bridge'
import { enumDefinitionBridge } from './bridges/enum-definition.bridge'
import { activityBridge } from './bridges/activity.bridge'
import { activitySkillLevelBridge } from './bridges/activity-skill-level.bridge'
import { sessionBridge } from './bridges/session.bridge'
import { memberBridge } from './bridges/member.bridge'
import { userBridge } from './bridges/user.bridge'
import { serverTypeBridge } from './bridges/server-type.bridge'
import { serverStatsBridge } from './bridges/server-stats.bridge'
import { memberStatsBridge } from './bridges/member-stats.bridge'
import { activityStatsBridge } from './bridges/activity-stats.bridge'
import { memberActivityStatsBridge } from './bridges/member-activity-stats.bridge'
import { enumDefinitionStatsBridge } from './bridges/enum-definition-stats.bridge'
import { Logger } from '../shared/logger'

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
  session: sessionBridge,
  member: memberBridge,
  user: userBridge,
  serverType: serverTypeBridge,
  serverStats: serverStatsBridge,
  memberStats: memberStatsBridge,
  activityStats: activityStatsBridge,
  memberActivityStats: memberActivityStatsBridge,
  enumDefinitionStats: enumDefinitionStatsBridge
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
