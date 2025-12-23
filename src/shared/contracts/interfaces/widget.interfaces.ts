import type { Component } from 'vue'
import { EWidgetCategory } from "../enums/widget-category.enum";


export interface IWidgetMetadata {
    id: string
    title: string
    icon?: string
    description?: string
    category: IWidgetCategory
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
    /**
     * If true, this widget requires configuration before being added.
     */
    requiresConfig?: boolean
}

export interface IWidgetCategory {
    /** Category machine name from metadata.category (lowercase) */
    key: EWidgetCategory
    /** Human-friendly label to show in UI (can map known categories) */
    label: string
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
    /**
     * Optional configuration for the widget (e.g. specific activity ID).
     */
    config?: Record<string, any>
}

export interface IWidgetComponent {
    id: string
    metadata: IWidgetMetadata
    component: Component
}
