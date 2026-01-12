/**
 * Activity Metadata Definition related interfaces
 */

export type ActivityMetadataType = 'NUMBER' | 'STRING' | 'BOOLEAN' | 'DATE'

export interface IActivityMetadataDefinition {
    public_id: string
    server_id: string
    activity_id: string
    key: string
    label: string | null
    type: ActivityMetadataType
    description: string | null
    required: boolean
    allow_not_predefined_value: boolean
    choices: (number | string | boolean)[] | null // ISO date strings for DATE
}

export interface ICreateActivityMetadataDefinitionRequest {
    key: string
    label?: string
    type: ActivityMetadataType
    description?: string
    required?: boolean
    allow_not_predefined_value?: boolean
    choices?: (number | string | boolean)[] // ISO date strings for DATE
}

export interface IUpdateActivityMetadataDefinitionRequest {
    label?: string
    description?: string
    required?: boolean
    allow_not_predefined_value?: boolean
    choices?: (number | string | boolean)[] // ISO date strings for DATE
    archived?: boolean
}

export interface IActivityMetadataDefinitionApiResponse<T = unknown> {
    data?: T
    error?: string
}
