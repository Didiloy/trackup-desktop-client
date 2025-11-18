/**
 * Session related interfaces
 */

export interface ISessionActivity {
    public_id: string
    name: string
}

export interface ISessionMember {
    public_id: string
    nickname: string
    avatar: string | null
}

/**
 * Enum data in a session
 */
export interface ISessionEnum {
    enum_selection_public_id: string
    enum_definition_public_id: string
    enum_value_public_id: string
    enum_definition_name: string
    selected_value: unknown
}

/**
 * Metadata in a session
 */
export interface ISessionMetadata {
    metadata_selection_public_id: string
    metadata_definition_public_id: string
    label: string
    type: string
    value: unknown
}

export interface ISession {
    public_id: string
    date: string
    duration: string
    comment?: string
    activity: ISessionActivity
    server_member: ISessionMember[]
    enum_definitions: ISessionEnum[]
    likes_count: number
    liked_by_me: boolean
    metadata: ISessionMetadata[]
}

/**
 * Enum selection when creating/updating a session
 * References an enum value from an enum definition and specifies which key to use
 */

export interface IUpdateSessionRequest {
    activity_id?: string
    duration?: number
    date?: string
    participants?: string[]
    comment?: string
}

export interface IUpdateSessionParticipantsRequest {
    participants: string[]
}

// New request to add enum selections to a session
export interface IAddSessionEnumsSelection {
    enum_value_id: string
    selected_key: 'value1' | 'value2' | 'value3' | 'value4' | 'value5'
}
export interface IAddSessionEnumsRequest {
    selections: IAddSessionEnumsSelection[]
}

export interface ISessionListItem {
    public_id: string
    date: string
    duration: string
    activity: ISessionActivity
    likes_count: number
    liked_by_me: boolean
    participants_count: number
}

export interface IPaginatedSessions {
    total: number
    page: number
    limit: number
    pageCount: number
    data: ISessionListItem[]
}

export interface IListSessionsOptions {
    page?: number
    limit?: number
}

export interface ISessionApiResponse<T = unknown> {
    data?: T
    error?: string
}

// New request to add metadata to a session
export interface IAddSessionMetadataEntry {
    metadata_definition_public_id: string
    value: unknown
}
export interface IAddSessionMetadataRequest {
    metadata: IAddSessionMetadataEntry[]
}
