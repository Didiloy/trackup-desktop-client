/**
 * Server Type related interfaces
 */

export interface IServerType {
  public_id: string
  name: string
}

export interface IServerTypeApiResponse<T = unknown> {
  data?: T
  error?: string
}

