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
 * Reuses IEnumValue from enums-definition and adds the definition name and selected key
 */
export interface ISessionEnum {
    enum_selection_id: string
    enum_definition_name: string
    selected_value: string
}

export interface ISession {
    public_id: string
    date: string
    duration: string
    activity: ISessionActivity
    server_member: ISessionMember[]
    enums: ISessionEnum[]
    likes_count: number
    liked_by_me: boolean
}

/**
 * Enum selection when creating/updating a session
 * References an enum value from an enum definition and specifies which key to use
 */

export interface ICreateSessionRequest {
    activity_id: string
    duration: number
    date: string
    participants: string[]
}

export interface IUpdateSessionRequest {
    activity_id?: string
    duration?: number
    date?: string
    participants?: string[]
}

// Detailed enum selection with full enum definition context
export interface ISessionEnumSelectionDetail {
    public_id: string
    activity_session_id: string
    enum_definition: {
        public_id: string
        name: string
        description: string
        enum_value_id: string
    }
    selected_key: string
    selected_value: string
}

// New request to add enum selections to a session
export interface IAddSessionEnumsSelection {
    enum_value_id: string
    selected_key: 'value1' | 'value2' | 'value3' | 'value4' | 'value5'
}
export interface IAddSessionEnumsRequest {
    selections: IAddSessionEnumsSelection[]
}

// New request to update an enum selection's selected_key
export interface IUpdateSessionEnumSelectionRequest {
    selected_key: 'value1' | 'value2' | 'value3' | 'value4' | 'value5'
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
