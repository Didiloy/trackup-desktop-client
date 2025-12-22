import type { Component } from 'vue'

export interface IWidgetMetadata {
    id: string
    title: string
    icon?: string
    description?: string
    category: 'server' | 'activity' | string
    /**
     * When set to false, this widget will be skipped by the discovery mechanism.
     * Default behavior (undefined or true) is to include the widget.
     */
    discoverable?: boolean
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
    component: Component
}
