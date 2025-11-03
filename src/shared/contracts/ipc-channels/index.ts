/**
 * IPC Channel Constants
 * Centralized location for all IPC channel names
 */

import { WINDOW_CHANNELS } from './types/window'
import { AUTH_CHANNELS } from './types/auth'
import { APP_CHANNELS } from './types/app'
import { SERVER_CHANNELS } from './types/server'
import { ENUM_DEFINITION_CHANNELS } from './types/enum-definition'

export const ipc_channels = {
  window: WINDOW_CHANNELS,
  auth: AUTH_CHANNELS,
  app: APP_CHANNELS,
  server: SERVER_CHANNELS,
  enumDefinition: ENUM_DEFINITION_CHANNELS
} as const
