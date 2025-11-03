import { ipcMain } from 'electron'
import { registerWindowIpc } from './window.ipc'
import { registerAppIpc } from './app.ipc'
import { registerServerIpc } from './server.ipc'
import { registerEnumDefinitionIpc } from './enum-definition.ipc'
import { registerActivityIpc } from './activity.ipc'
import { registerActivitySkillLevelIpc } from './activity-skill-level.ipc'
import { registerSessionIpc } from './session.ipc'
import { registerMemberIpc } from './member.ipc'
import { registerUserIpc } from './user.ipc'
import { registerServerTypeIpc } from './server-type.ipc'
import { registerServerStatsIpc } from './server-stats.ipc'
import { registerMemberStatsIpc } from './member-stats.ipc'
import { registerActivityStatsIpc } from './activity-stats.ipc'

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
}
