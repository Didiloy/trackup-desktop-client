/**
 * Enum Definition related interfaces
 */

export interface IEnumValue {
  public_id: string
  value1?: string
  value2?: string
  value3?: string
  value4?: string
  value5?: string
}

export interface IEnumDefinition {
  public_id: string
  name: string
  description: string | null
  values: IEnumValue[]
}

export interface ICreateEnumDefinitionRequest {
  name: string
  description?: string
  value1?: string
  value2?: string
  value3?: string
  value4?: string
  value5?: string
}

export interface IUpdateEnumDefinitionRequest {
  name?: string
  description?: string
  value1?: string
  value2?: string
  value3?: string
  value4?: string
  value5?: string
}

export interface IEnumDefinitionApiResponse<T = unknown> {
  data?: T
  error?: string
}

