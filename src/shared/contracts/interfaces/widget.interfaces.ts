export interface IWidgetMetadata {
    id: string
    title: string
    icon?: string
    description?: string
    category: 'server' | 'activity' | string
    defaultSize: {
        w: number
        h: number
        minW?: number
        minH?: number
        maxW?: number
        maxH?: number
    }
}

export interface IWidgetLayoutItem {
    i: string // widget id
    x: number
    y: number
    w: number
    h: number
    minW?: number
    minH?: number
    maxW?: number
    maxH?: number
}

export interface IWidgetComponent {
    id: string
    metadata: IWidgetMetadata
    component: any
}

