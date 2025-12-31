import { ref, computed, watch, type ComputedRef } from 'vue'
import type {
    IWidgetLayoutItem,
    IWidgetMetadata
} from '@shared/contracts/interfaces/widget.interfaces'
import { useWidgetPersistence } from './useWidgetPersistence'

interface WidgetModule {
    default: { widgetMetadata?: IWidgetMetadata }
}
type WidgetImporter = () => Promise<WidgetModule>

/**
 * Generate a unique instance ID for a widget
 * Format: {widgetType}-{timestamp}-{random}
 */
function generateWidgetInstanceId(widgetType: string): string {
    return `${widgetType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extract widget type from instance ID
 */
function getWidgetTypeFromId(instanceId: string): string {
    // Format: {widgetType}-{timestamp}-{random}
    // Extract everything before the last two segments
    const parts = instanceId.split('-')
    return parts.slice(0, -2).join('-')
}

/**
 * Default widgets list
 */
const DEFAULT_WIDGETS: WidgetImporter[] = [
    () =>
        import(
            '@/components/widgets/server/ServerTotalSessions.widget.vue'
        ) as Promise<WidgetModule>,
    () =>
        import(
            '@/components/widgets/server/ServerActiveMembers.widget.vue'
        ) as Promise<WidgetModule>,
    () =>
        import(
            '@/components/widgets/server/ServerTimelineChart.widget.vue'
        ) as Promise<WidgetModule>
]

interface UseWidgetLayoutResult {
    layout: ComputedRef<IWidgetLayoutItem[]>
    isDirty: ComputedRef<boolean>
    isLoading: ComputedRef<boolean>
    resetLayout: () => Promise<IWidgetLayoutItem[]>
    addWidget: (widgetId: string, metadata: IWidgetMetadata, config?: any) => void
    removeWidget: (widgetId: string) => void
    updateLayout: (newLayout: IWidgetLayoutItem[]) => void
    hasWidget: (widgetId: string, metadata?: IWidgetMetadata) => boolean
    saveChanges: () => void
    discardChanges: () => Promise<void>
    reload: () => Promise<void>
}

/**
 * Composable to manage widget layout.
 * RESPONSIBILITY: Grid State, Positioning, Coordination with Persistence.
 *
 * Uses a "draft mode" approach:
 * - Changes are made to a working copy (layout)
 * - Changes are only persisted when saveChanges() is called
 * - discardChanges() reverts to the last saved state
 */
export function useWidgetLayout(serverId: string): UseWidgetLayoutResult {
    const { load, save } = useWidgetPersistence()
    const storageKey = computed(() => `widgets-layout-server-${serverId}`)

    // Working copy of the layout (can be modified without saving)
    const layout = ref<IWidgetLayoutItem[]>([])
    // Snapshot of the last saved layout
    const savedLayout = ref<IWidgetLayoutItem[]>([])
    const isDirty = ref(false)
    const isLoading = ref(false)

    /**
     * Automatically generate a layout based on widget metadata
     */
    async function getDefaultLayout(): Promise<IWidgetLayoutItem[]> {
        const items: IWidgetLayoutItem[] = []

        let currentX = 0
        let currentY = 0
        let rowMaxHeight = 0

        for (const importFn of DEFAULT_WIDGETS) {
            try {
                const module = await importFn()
                const metadata: IWidgetMetadata | undefined = module.default.widgetMetadata

                if (!metadata) continue

                const { w, h, minW, minH, maxW, maxH } = metadata.defaultSize

                // Simple flow layout logic
                if (currentX + w > 12) {
                    currentX = 0
                    currentY += rowMaxHeight
                    rowMaxHeight = 0
                }

                items.push({
                    i: generateWidgetInstanceId(metadata.id),
                    x: currentX,
                    y: currentY,
                    w,
                    h,
                    minW,
                    minH,
                    maxW,
                    maxH
                })

                currentX += w
                rowMaxHeight = Math.max(rowMaxHeight, h)
            } catch (error) {
                console.error('Failed to load default widget:', error)
            }
        }

        return items
    }

    /**
     * Load layout using atomic persistence
     */
    async function loadLayout(): Promise<void> {
        isLoading.value = true
        const stored = load<IWidgetLayoutItem[]>(storageKey.value)
        if (stored) {
            layout.value = JSON.parse(JSON.stringify(stored))
            savedLayout.value = JSON.parse(JSON.stringify(stored))
        } else {
            const defaults = await getDefaultLayout()
            layout.value = JSON.parse(JSON.stringify(defaults))
            savedLayout.value = JSON.parse(JSON.stringify(defaults))
            // Save default layout immediately
            save(storageKey.value, defaults)
        }
        isDirty.value = false
        isLoading.value = false
    }

    /**
     * Save current layout to persistence
     */
    function saveChanges(): void {
        save(storageKey.value, layout.value)
        savedLayout.value = JSON.parse(JSON.stringify(layout.value))
        isDirty.value = false
    }

    /**
     * Discard all unsaved changes and revert to last saved state
     */
    async function discardChanges(): Promise<void> {
        layout.value = JSON.parse(JSON.stringify(savedLayout.value))
        isDirty.value = false
    }

    async function resetLayout(): Promise<IWidgetLayoutItem[]> {
        isLoading.value = true
        const defaults = await getDefaultLayout()
        layout.value = JSON.parse(JSON.stringify(defaults))
        savedLayout.value = JSON.parse(JSON.stringify(defaults))
        save(storageKey.value, defaults)
        isDirty.value = false
        isLoading.value = false
        return defaults
    }

    function addWidget(widgetId: string, metadata: IWidgetMetadata, config?: any): void {
        // For widgets without config, check if already exists
        if (
            !metadata.requiresConfig &&
            layout.value.some((item) => getWidgetTypeFromId(item.i) === widgetId)
        ) {
            return
        }

        let maxY = 0
        let maxYHeight = 0
        layout.value.forEach((item) => {
            const bottom = item.y + item.h
            if (bottom > maxY) {
                maxY = item.y
                maxYHeight = item.h
            }
        })

        const newItem: IWidgetLayoutItem = {
            i: generateWidgetInstanceId(widgetId),
            x: 0,
            y: maxY + maxYHeight,
            w: metadata.defaultSize.w,
            h: metadata.defaultSize.h,
            minW: metadata.defaultSize.minW,
            minH: metadata.defaultSize.minH,
            maxW: metadata.defaultSize.maxW,
            maxH: metadata.defaultSize.maxH,
            config
        }

        layout.value.push(newItem)
        isDirty.value = true
        // Don't save immediately - wait for user to confirm
    }

    function removeWidget(widgetId: string): void {
        const index = layout.value.findIndex((item) => item.i === widgetId)
        if (index !== -1) {
            layout.value.splice(index, 1)
            isDirty.value = true
            // Don't save immediately - wait for user to confirm
        }
    }

    function updateLayout(newLayout: IWidgetLayoutItem[]): void {
        layout.value = newLayout
        isDirty.value = true
        // Don't save immediately - wait for user to confirm
    }

    function hasWidget(widgetId: string, metadata?: IWidgetMetadata): boolean {
        // Widgets with config can have multiple instances
        if (metadata?.requiresConfig) {
            return false
        }
        // Widgets without config can only have one instance
        return layout.value.some((item) => getWidgetTypeFromId(item.i) === widgetId)
    }

    // Initial load
    void loadLayout()

    // Watch for entity changes to reload layout
    watch(storageKey, () => {
        void loadLayout()
    })

    return {
        layout: computed(() => layout.value),
        isDirty: computed(() => isDirty.value),
        isLoading: computed(() => isLoading.value),
        resetLayout,
        addWidget,
        removeWidget,
        updateLayout,
        hasWidget,
        saveChanges,
        discardChanges,
        reload: loadLayout
    }
}
