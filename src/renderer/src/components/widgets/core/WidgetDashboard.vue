<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgets } from '@/composables/widgets/useWidgets'
import { useWidgetLayout } from '@/composables/widgets/useWidgetLayout'
import WidgetDashboardHeader from './WidgetDashboardHeader.vue'
import WidgetGrid from './WidgetGrid.vue'
import WidgetAddDialog from './WidgetAddDialog.vue'
import WidgetConfigDialog from './WidgetConfigDialog.vue'
import type { IWidgetComponent } from '@shared/contracts/interfaces/widget.interfaces'

const props = defineProps<{
    serverId: string
}>()

const { t } = useI18n()

// Use refactored composables
const { widgets, categoryOptions, getWidgetById } = useWidgets()
const {
    layout,
    isDirty,
    addWidget,
    removeWidget,
    updateLayout,
    resetLayout,
    hasWidget,
    saveChanges,
    discardChanges,
    isLoading: isLayoutLoading
} = useWidgetLayout(props.serverId)

// Dashboard state
const isEditing = ref(false)
const showAddDialog = ref(false)
const showConfigDialog = ref(false)
const selectedWidgetForConfig = ref<IWidgetComponent | null>(null)

// Derived state for the add dialog
const availableWidgetsToAdd = computed(() =>
    widgets.value.filter((widget) => !hasWidget(widget.id, widget.metadata))
)

/**
 * Event Handlers
 */
async function handleAddWidgetRequest(widgetId: string): Promise<void> {
    const widget = getWidgetById(widgetId)
    if (!widget) return

    showAddDialog.value = false

    if (widget.metadata.requiresConfig) {
        // Wait for dialog to close before opening config dialog
        await nextTick()
        selectedWidgetForConfig.value = widget
        showConfigDialog.value = true
    } else {
        addWidget(widgetId, widget.metadata)
    }
}

function handleConfigSave(config: any): void {
    if (!selectedWidgetForConfig.value) return

    addWidget(selectedWidgetForConfig.value.id, selectedWidgetForConfig.value.metadata, config)
    showConfigDialog.value = false
    selectedWidgetForConfig.value = null
}

async function handleCancel(): Promise<void> {
    await discardChanges()
    isEditing.value = false
}

function handleDone(): void {
    saveChanges()
    isEditing.value = false
}
</script>

<template>
    <div class="widget-dashboard flex flex-col gap-6">
        <WidgetDashboardHeader
            v-model:is-editing="isEditing"
            :widget-count="layout.length"
            :is-dirty="isDirty"
            @add="showAddDialog = true"
            @reset="resetLayout"
            @cancel="handleCancel"
            @done="handleDone"
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
            <p class="text-surface-500 mb-4">{{ t('widgets.ui.empty_state') }}</p>
            <Button
                class="px-4 py-2 bg-success-500 text-white rounded-md flex items-center gap-2"
                @click="showAddDialog = true"
            >
                <i class="pi pi-plus"></i>
                {{ t('widgets.ui.add_widget') }}
            </Button>
        </div>

        <WidgetAddDialog
            v-model:visible="showAddDialog"
            :available-widgets="availableWidgetsToAdd"
            :category-options="categoryOptions"
            @select="handleAddWidgetRequest"
        />

        <WidgetConfigDialog
            v-if="selectedWidgetForConfig"
            v-model:visible="showConfigDialog"
            :widget="selectedWidgetForConfig"
            @save="handleConfigSave"
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
