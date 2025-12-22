import { ref, computed, type Component } from 'vue'
import type { IWidgetComponent, IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'

/**
 * Composable to discover and load widgets dynamically based on context
 * @param context - The widget category/context ('server' | 'activity' | etc.)
 */
export function useWidgets(context: 'server' | 'activity' | string) {
    const widgets = ref<IWidgetComponent[]>([])
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    /**
     * Dynamically import all widget files from the specified context directory
     */
    async function discoverWidgets() {
        isLoading.value = true
        error.value = null

        try {
            // Import all .widget.vue files from the context directory
            const widgetModules = import.meta.glob(
                '@/components/widgets/**/*.widget.vue',
                { eager: true }
            ) as Record<string, any>

            const discoveredWidgets: IWidgetComponent[] = []

            // Filter and process widgets for the current context
            for (const [path, module] of Object.entries(widgetModules)) {
                // Check if the path matches our context
                if (!path.includes(`/widgets/${context}/`)) {
                    continue
                }

                // Extract metadata from the component
                const component = module.default
                const metadata = component?.widgetMetadata as IWidgetMetadata | undefined

                if (!metadata) {
                    console.warn(`Widget at ${path} is missing widgetMetadata`)
                    continue
                }

                // Verify the category matches
                if (metadata.category !== context) {
                    console.warn(
                        `Widget ${metadata.id} has category '${metadata.category}' but was found in '${context}' directory`
                    )
                    continue
                }

                discoveredWidgets.push({
                    id: metadata.id,
                    metadata,
                    component
                })
            }

            widgets.value = discoveredWidgets

            console.log(`Discovered ${discoveredWidgets.length} widgets for context '${context}'`)
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Failed to discover widgets')
            console.error('Error discovering widgets:', err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get a widget by its ID
     */
    function getWidgetById(id: string): IWidgetComponent | undefined {
        return widgets.value.find(w => w.id === id)
    }

    /**
     * Get widgets sorted by title
     */
    const sortedWidgets = computed(() => {
        return [...widgets.value].sort((a, b) =>
            a.metadata.title.localeCompare(b.metadata.title)
        )
    })

    /**
     * Get available widgets (those that are discovered)
     */
    const availableWidgets = computed(() => widgets.value)

    // Auto-discover widgets on initialization
    discoverWidgets()

    return {
        widgets: availableWidgets,
        sortedWidgets,
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),
        getWidgetById,
        refresh: discoverWidgets
    }
}

