import { ref, markRaw, shallowRef, computed } from 'vue'
import {
    type IWidgetComponent,
    type IWidgetMetadata
} from '@shared/contracts/interfaces/widget.interfaces'

/**
 * Atomic Composable: Widget Discovery
 * Responsibility: Scanning the file system for .widget.vue files and extracting metadata.
 */
export function useWidgetDiscovery() {
    const widgets = shallowRef<IWidgetComponent[]>([])
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
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Failed to discover widgets')
            console.error('Error discovering widgets:', err)
        } finally {
            isLoading.value = false
        }
    }

    // Auto-discover if not already done
    if (widgets.value.length === 0) {
        void discoverWidgets()
    }

    return {
        widgets: computed(() => widgets.value),
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),
        discoverWidgets
    }
}
