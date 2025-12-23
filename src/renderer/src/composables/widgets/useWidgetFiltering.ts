import { computed, type Ref } from 'vue'
import {
    type IWidgetComponent,
    type IWidgetCategory,
    type ISelectOption
} from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

/**
 * Atomic Composable: Widget Filtering & Grouping
 * Responsibility: Processing discovered widgets for UI display (filtering, categories, sorting).
 */
export function useWidgetFiltering(widgets: Ref<IWidgetComponent[]>) {
    const sortedWidgets = computed<IWidgetComponent[]>(() => {
        return [...widgets.value].sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))
    })

    const categories = computed<IWidgetCategory[]>(() => {
        const labels = new Map<string, string>()
        const seenKeys = new Set<string>()

        for (const w of widgets.value) {
            const cat = w.metadata.category
            if (!cat) continue
            const key = cat.key
            seenKeys.add(key)
            if (!labels.has(key)) labels.set(key, cat.label)
        }

        return Array.from(seenKeys).map((key) => ({
            key: key as EWidgetCategory,
            label: labels.get(key) ?? key
        }))
    })

    const categoryOptions = computed<ISelectOption[]>(() => {
        return categories.value.map((c) => ({
            value: c.key,
            label: c.label,
            count: widgets.value.filter((w) => w.metadata.category.key === c.key).length
        }))
    })

    function filterWidgetsByCategory(categoryKey: string | null): IWidgetComponent[] {
        if (!categoryKey) return sortedWidgets.value
        return sortedWidgets.value.filter((w) => w.metadata.category.key === categoryKey)
    }

    const groups = computed(() => {
        const map = new Map<string, IWidgetComponent[]>()
        for (const w of sortedWidgets.value) {
            const key = w.metadata.category.key
            if (!key) continue
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(w)
        }
        return categories.value.map((c) => ({ category: c, widgets: map.get(c.key) ?? [] }))
    })

    function getWidgetById(id: string): IWidgetComponent | undefined {
        return widgets.value.find((w) => w.id === id)
    }

    return {
        sortedWidgets,
        categories,
        categoryOptions,
        groups,
        filterWidgetsByCategory,
        getWidgetById
    }
}
