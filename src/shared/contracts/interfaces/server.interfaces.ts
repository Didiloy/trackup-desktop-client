/**
 * Server-related interfaces
 */

export interface IServer {
  public_id: string
  name: string
  server_type_public_id: string
  creator_id: string
  description: string | null
  logo: string | null
  invite_code: string | null
  invite_code_expires_at: string | null
}

export interface ICreateServerRequest {
  name: string
  type_public_id: string
  description?: string
  logo?: string
}

export interface IUpdateServerRequest {
  name?: string
  type_public_id?: string
  description?: string
  logo?: string
}

export interface IJoinServerRequest {
  code: string
}

export interface IServerApiResponse<T = unknown> {
  data?: T
  error?: string
}
