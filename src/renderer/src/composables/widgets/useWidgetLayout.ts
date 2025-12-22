import { ref, computed, watch } from 'vue'
import type { IWidgetLayoutItem, IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'

/**
 * Default widget layouts per context
 */
const DEFAULT_LAYOUTS: Record<string, Record<string, IWidgetLayoutItem[]>> = {
    server: {
        default: [
            { i: 'server-total-sessions', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'server-active-members', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'server-timeline-chart', x: 0, y: 2, w: 12, h: 4, minW: 6, minH: 3 }
        ]
    },
    activity: {
        default: [
            { i: 'activity-duration', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'activity-participants', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'activity-timeline-chart', x: 0, y: 2, w: 12, h: 4, minW: 6, minH: 3 }
        ]
    }
}

/**
 * Composable to manage widget layout persistence
 * @param context - The widget context ('server' | 'activity' | etc.)
 * @param entityId - The entity ID (serverId, activityId, etc.)
 */
export function useWidgetLayout(context: string, entityId: string) {
    const storageKey = computed(() => `widgets-layout-${context}-${entityId}`)
    const layout = ref<IWidgetLayoutItem[]>([])
    const isDirty = ref(false)

    /**
     * Load layout from localStorage
     */
    function loadLayout(): IWidgetLayoutItem[] {
        try {
            const stored = localStorage.getItem(storageKey.value)
            if (stored) {
                const parsed = JSON.parse(stored) as IWidgetLayoutItem[]
                console.log(`Loaded layout for ${storageKey.value}:`, parsed.length, 'widgets')
                return parsed
            }
        } catch (error) {
            console.error('Error loading widget layout:', error)
        }

        // Return default layout if nothing is stored
        return getDefaultLayout()
    }

    /**
     * Save layout to localStorage
     */
    function saveLayout(newLayout?: IWidgetLayoutItem[]) {
        try {
            const layoutToSave = newLayout || layout.value
            localStorage.setItem(storageKey.value, JSON.stringify(layoutToSave))
            isDirty.value = false
            console.log(`Saved layout for ${storageKey.value}:`, layoutToSave.length, 'widgets')
        } catch (error) {
            console.error('Error saving widget layout:', error)
        }
    }

    /**
     * Get default layout for the context
     */
    function getDefaultLayout(): IWidgetLayoutItem[] {
        const contextDefaults = DEFAULT_LAYOUTS[context]
        if (contextDefaults) {
            return [...contextDefaults.default]
        }
        return []
    }

    /**
     * Reset layout to default
     */
    function resetLayout() {
        const defaultLayout = getDefaultLayout()
        layout.value = defaultLayout
        saveLayout(defaultLayout)
        return defaultLayout
    }

    /**
     * Add a widget to the layout
     */
    function addWidget(widgetId: string, metadata: IWidgetMetadata) {
        // Check if widget already exists
        if (layout.value.some(item => item.i === widgetId)) {
            console.warn(`Widget ${widgetId} already exists in layout`)
            return
        }

        // Calculate position for new widget (bottom of the grid)
        let maxY = 0
        let maxYHeight = 0

        layout.value.forEach(item => {
            const bottom = item.y + item.h
            if (bottom > maxY) {
                maxY = item.y
                maxYHeight = item.h
            }
        })

        const newItem: IWidgetLayoutItem = {
            i: widgetId,
            x: 0,
            y: maxY + maxYHeight,
            w: metadata.defaultSize.w,
            h: metadata.defaultSize.h,
            minW: metadata.defaultSize.minW,
            minH: metadata.defaultSize.minH,
            maxW: metadata.defaultSize.maxW,
            maxH: metadata.defaultSize.maxH
        }

        layout.value.push(newItem)
        isDirty.value = true
        saveLayout()
    }

    /**
     * Remove a widget from the layout
     */
    function removeWidget(widgetId: string) {
        const index = layout.value.findIndex(item => item.i === widgetId)
        if (index !== -1) {
            layout.value.splice(index, 1)
            isDirty.value = true
            saveLayout()
        }
    }

    /**
     * Update the entire layout (called when grid is modified)
     */
    function updateLayout(newLayout: IWidgetLayoutItem[]) {
        layout.value = newLayout
        isDirty.value = true
        saveLayout(newLayout)
    }

    /**
     * Check if a widget is in the layout
     */
    function hasWidget(widgetId: string): boolean {
        return layout.value.some(item => item.i === widgetId)
    }

    /**
     * Get widget IDs currently in the layout
     */
    const widgetIds = computed(() => layout.value.map(item => item.i))

    // Initialize layout
    layout.value = loadLayout()

    // Auto-save on layout changes
    watch(layout, () => {
        if (isDirty.value) {
            saveLayout()
        }
    }, { deep: true })

    return {
        layout: computed(() => layout.value),
        widgetIds,
        isDirty: computed(() => isDirty.value),
        loadLayout,
        saveLayout,
        resetLayout,
        addWidget,
        removeWidget,
        updateLayout,
        hasWidget
    }
}

