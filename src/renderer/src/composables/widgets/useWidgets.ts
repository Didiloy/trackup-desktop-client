import { ref, computed, markRaw } from 'vue'
import type {
    IWidgetComponent,
    IWidgetMetadata
} from '@shared/contracts/interfaces/widget.interfaces'
import type { ComputedRef } from 'vue'

/**
 * Composable to discover and load all widgets dynamically.
 * No context filtering: returns every widget found under components/widgets.
 */
export function useWidgets(): {
    widgets: ComputedRef<IWidgetComponent[]>
    sortedWidgets: ComputedRef<IWidgetComponent[]>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<Error | null>
    getWidgetById: (id: string) => IWidgetComponent | undefined
    refresh: () => Promise<void>
} {
    const widgets = ref<IWidgetComponent[]>([])
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    async function discoverWidgets(): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const widgetModules = import.meta.glob('@/components/widgets/**/*.widget.vue', {
                eager: true
            }) as Record<string, unknown>

            const discoveredWidgets: IWidgetComponent[] = []

            for (const [path, module] of Object.entries(widgetModules)) {
                const sfc = (module as { default: unknown }).default as unknown as {
                    widgetMetadata?: IWidgetMetadata
                }

                const metadata = sfc?.widgetMetadata
                if (!metadata) {
                    console.warn(`Widget at ${path} is missing widgetMetadata`)
                    continue
                }

                // Skip widgets that opt out of discovery
                if (metadata.discoverable === false) {
                    continue
                }

                discoveredWidgets.push({
                    id: metadata.id,
                    metadata,
                    component: markRaw(sfc) as unknown as never
                })
            }

            widgets.value = discoveredWidgets

            console.log(`Discovered ${discoveredWidgets.length} widgets (no context filtering)`)
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Failed to discover widgets')
            console.error('Error discovering widgets:', err)
        } finally {
            isLoading.value = false
        }
    }

    function getWidgetById(id: string): IWidgetComponent | undefined {
        return widgets.value.find((w) => w.id === id)
    }

    const sortedWidgets = computed<IWidgetComponent[]>(() => {
        return [...widgets.value].sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
    })

    const availableWidgets = computed<IWidgetComponent[]>(() => widgets.value)

    void discoverWidgets()

    return {
        widgets: availableWidgets,
        sortedWidgets,
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),
        getWidgetById,
        refresh: discoverWidgets
    }
}
