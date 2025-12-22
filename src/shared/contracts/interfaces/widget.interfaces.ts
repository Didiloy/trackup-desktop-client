import type { Component } from 'vue'

export enum EWidgetCategory {
    Server = 'server',
    Activity = 'activity',
    Custom = 'custom'
}

export interface IWidgetMetadata {
    id: string
    title: string
    icon?: string
    description?: string
    category: EWidgetCategory
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

export interface IWidgetCategory {
    /** Category machine name from metadata.category (lowercase) */
    key: string
    /** Human-friendly label to show in UI (can map known categories) */
    label: string
    /** Number of widgets in this category */
    count: number
}

export interface ISelectOption {
    value: string
    label: string
    count?: number
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
