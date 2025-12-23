import { useWidgetDiscovery } from './useWidgetDiscovery'
import { useWidgetFiltering } from './useWidgetFiltering'

/**
 * Composable Facade for Widgets
 * RESPONSIBILITY: Orchestrating discovery and filtering for the UI.
 * This remains the primary entry point for components that just want "everything".
 */
export function useWidgets() {
    const { widgets, isLoading, error, discoverWidgets } = useWidgetDiscovery()
    const { sortedWidgets, categoryOptions, groups, getWidgetById } = useWidgetFiltering(widgets)

    return {
        widgets: sortedWidgets,
        categoryOptions,
        groups,
        isLoading,
        error,
        getWidgetById,
        refresh: discoverWidgets
    }
}
