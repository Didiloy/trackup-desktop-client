<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWidgets } from '@/composables/widgets/useWidgets'
import { useWidgetLayout } from '@/composables/widgets/useWidgetLayout'
import WidgetDashboardHeader from './WidgetDashboardHeader.vue'
import WidgetGrid from './WidgetGrid.vue'
import WidgetAddDialog from './WidgetAddDialog.vue'

const props = defineProps<{
    serverId: string
}>()

// Use refactored composables
const { widgets, categoryOptions, getWidgetById } = useWidgets()
const {
    layout,
    addWidget,
    removeWidget,
    updateLayout,
    resetLayout,
    hasWidget,
    isLoading: isLayoutLoading
} = useWidgetLayout(props.serverId)

// Dashboard state
const isEditing = ref(false)
const showAddDialog = ref(false)

// Derived state for the add dialog
const availableWidgetsToAdd = computed(() =>
    widgets.value.filter((widget) => !hasWidget(widget.id))
)

/**
 * Event Handlers
 */
function handleAddWidgetRequest(widgetId: string): void {
    const widget = getWidgetById(widgetId)
    if (!widget) return

    showAddDialog.value = false
    addWidget(widgetId, widget.metadata)
}
</script>

<template>
    <div class="widget-dashboard flex flex-col gap-6">
        <WidgetDashboardHeader
            v-model:is-editing="isEditing"
            @add="showAddDialog = true"
            @reset="resetLayout"
        />

        <div v-if="isLayoutLoading" class="grow flex items-center justify-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
        </div>

        <WidgetGrid
            v-else-if="layout.length > 0"
            class="grow"
            :layout="layout"
            :is-editing="isEditing"
            :col-num="12"
            :row-height="60"
            :get-widget-by-id="getWidgetById"
            @update:layout="updateLayout"
            @remove="removeWidget"
        />

        <!-- Empty state -->
        <div v-else class="empty-state flex flex-col items-center justify-center py-16 text-center">
            <i class="pi pi-th-large text-6xl text-surface-300 mb-4"></i>
            <p class="text-surface-500 mb-4">
                Widget dashboard is empty
            </p>
            <button
                class="px-4 py-2 bg-success-500 text-white rounded-md flex items-center gap-2"
                @click="showAddDialog = true"
            >
                <i class="pi pi-plus"></i>
                Add Widget
            </button>
        </div>

        <WidgetAddDialog
            v-model:visible="showAddDialog"
            :available-widgets="availableWidgetsToAdd"
            :category-options="categoryOptions"
            @select="handleAddWidgetRequest"
        />
    </div>
</template>

<style scoped>
.widget-dashboard {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 2rem;
}
</style>
