import { ref, computed, markRaw } from 'vue'
import type {
    IWidgetComponent,
    IWidgetMetadata,
    IWidgetCategory,
    ISelectOption
} from '@shared/contracts/interfaces/widget.interfaces'
import type { ComputedRef } from 'vue'

interface IWidgetGroup {
    category: IWidgetCategory
    widgets: IWidgetComponent[]
}

/**
 * Composable to discover and load all widgets dynamically (no context filtering).
 */
export function useWidgets(): {
    widgets: ComputedRef<IWidgetComponent[]>
    sortedWidgets: ComputedRef<IWidgetComponent[]>
    categories: ComputedRef<IWidgetCategory[]>
    categoryOptions: ComputedRef<ISelectOption[]>
    groups: ComputedRef<IWidgetGroup[]>
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

    // Derive categories from widget metadata
    const categories = computed<IWidgetCategory[]>(() => {
        const counts = new Map<string, number>()
        const labels = new Map<string, string>()

        for (const w of widgets.value) {
            const key = String(w.metadata.category ?? '').toLowerCase()
            if (!key) continue
            counts.set(key, (counts.get(key) ?? 0) + 1)
            // Simple label mapping: capitalize first letter; can be replaced by i18n map
            if (!labels.has(key)) labels.set(key, key.charAt(0).toUpperCase() + key.slice(1))
        }
        return [...counts.entries()].map(([key, count]) => ({
            key,
            label: labels.get(key) ?? key,
            count
        }))
    })

    // Options for UI selects
    const categoryOptions = computed<ISelectOption[]>(() => {
        return categories.value.map((c) => ({ value: c.key, label: c.label, count: c.count }))
    })

    // Group widgets by category for easier rendering
    const groups = computed<IWidgetGroup[]>(() => {
        const map = new Map<string, IWidgetComponent[]>()
        for (const w of sortedWidgets.value) {
            const key = String(w.metadata.category ?? '').toLowerCase()
            if (!key) continue
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(w)
        }
        return categories.value.map((c) => ({ category: c, widgets: map.get(c.key) ?? [] }))
    })

    const availableWidgets = computed<IWidgetComponent[]>(() => widgets.value)

    void discoverWidgets()

    return {
        widgets: availableWidgets,
        sortedWidgets,
        categories,
        categoryOptions,
        groups,
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),
        getWidgetById,
        refresh: discoverWidgets
    }
}
