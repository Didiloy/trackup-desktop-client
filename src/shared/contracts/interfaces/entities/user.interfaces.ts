/**
 * User related interfaces
 */

import type { IServer } from './server.interfaces'

export interface IUser {
  id: string
  email: string
}

export interface IUserApiResponse<T = unknown> {
  data?: T
  error?: string
}

// Reuse IServer from servers.interfaces for user's servers list
export type IUserServer = Omit<IServer, 'invite_code' | 'invite_code_expires_at'>
