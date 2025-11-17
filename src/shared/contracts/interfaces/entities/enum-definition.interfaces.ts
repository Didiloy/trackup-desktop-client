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
    values: string[]
}

// Value update item for PUT updates
export interface IEnumValueUpdate {
    enum_value_id: string
    key: 'value1' | 'value2' | 'value3' | 'value4' | 'value5'
    value: string
}

export interface IUpdateEnumDefinitionRequest {
    name?: string
    description?: string
    value_updates?: IEnumValueUpdate[]
}

export interface IEnumDefinitionApiResponse<T = unknown> {
    data?: T
    error?: string
}
