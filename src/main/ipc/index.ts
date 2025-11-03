import { ipcMain } from 'electron'
import { registerWindowIpc } from './window.ipc'
import { registerAppIpc } from './app.ipc'
import { registerServerIpc } from './entities/server.ipc'
import { registerEnumDefinitionIpc } from './entities/enum-definition.ipc'
import { registerActivityIpc } from './entities/activity.ipc'
import { registerActivitySkillLevelIpc } from './entities/activity-skill-level.ipc'
import { registerSessionIpc } from './entities/session.ipc'
import { registerMemberIpc } from './entities/member.ipc'
import { registerUserIpc } from './entities/user.ipc'
import { registerServerTypeIpc } from './entities/server-type.ipc'
import { registerServerStatsIpc } from './entities-stats/server-stats.ipc'
import { registerMemberStatsIpc } from './entities-stats/member-stats.ipc'
import { registerActivityStatsIpc } from './entities-stats/activity-stats.ipc'
import { registerMemberActivityStatsIpc } from './entities-stats/member-activity-stats.ipc'
import { registerEnumDefinitionStatsIpc } from './entities-stats/enum-definition-stats.ipc'
import { registerSnapshotStatsIpc } from './entities-stats/snapshot-stats.ipc'
import { registerBillingIpc } from './billing.ipc'

/**
 * Register all IPC handlers
 * Central place to wire up all IPC modules
 */
export function registerAllIpc(): void {
  // Clear any existing handlers (useful for hot reload in development)
  ipcMain.removeAllListeners()

  // Register domain-specific IPC handlers
  registerWindowIpc()
  registerAppIpc()
  registerServerIpc()
  registerEnumDefinitionIpc()
  registerActivityIpc()
  registerActivitySkillLevelIpc()
  registerSessionIpc()
  registerMemberIpc()
  registerUserIpc()
  registerServerTypeIpc()

  // Register stats IPC handlers
  registerServerStatsIpc()
  registerMemberStatsIpc()
  registerActivityStatsIpc()
  registerMemberActivityStatsIpc()
  registerEnumDefinitionStatsIpc()
  registerSnapshotStatsIpc()

  // Register billing IPC handlers
  registerBillingIpc()
}
