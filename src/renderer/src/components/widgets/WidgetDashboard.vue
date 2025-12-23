<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useI18n } from 'vue-i18n'
import { useWidgets } from '@/composables/widgets/useWidgets'
import { useWidgetLayout } from '@/composables/widgets/useWidgetLayout'
import type {
    IWidgetLayoutItem,
    IWidgetComponent
} from '@shared/contracts/interfaces/widget.interfaces'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import Select from 'primevue/select'
import WidgetConfigDialog from './WidgetConfigDialog.vue'
import ToggleButton from 'primevue/togglebutton'

const props = defineProps<{
    context: 'server' | 'activity' | string
    entityId: string
}>()

const { t } = useI18n()
// Discover all widgets globally (no context filtering)
const { widgets, getWidgetById, categoryOptions } = useWidgets()
// Layout remains contextual to props.context and entityId
const { layout, addWidget, removeWidget, updateLayout, resetLayout, hasWidget } =
    useWidgetLayout(props.context, props.entityId)

const showAddDialog = ref(false)
const showConfigDialog = ref(false)
const isEditing = ref(false)
// Grid layout props
const colNum = ref(12)
const rowHeight = ref(60)

// Computed for drag/resize based on isEditing
const isDraggable = computed(() => isEditing.value)
const isResizable = computed(() => isEditing.value)

// Category selection state for the add-widget modal
const selectedCategory = ref<string | null>(null)
const selectedWidgetForConfig = ref<IWidgetComponent | null>(null)

// Initialize default category when dialog opens
watch(showAddDialog, (visible) => {
    if (visible) {
        // Choose first category by default if none selected
        selectedCategory.value = selectedCategory.value ?? categoryOptions.value[0]?.value ?? null
    }
})

/**
 * Available widgets that are not currently in the layout
 */
const availableWidgetsToAdd = computed<IWidgetComponent[]>(() => {
    const base = widgets.value.filter((widget) => !hasWidget(widget.id))
    if (!selectedCategory.value) return base
    return base.filter((w) => String(w.metadata.category).toLowerCase() === selectedCategory.value)
})

/**
 * Handle layout update from grid-layout-plus
 */
function handleLayoutUpdate(newLayout: IWidgetLayoutItem[]): void {
    updateLayout(newLayout)
}

/**
 * Handle add widget
 */
function handleAddWidget(widgetId: string): void {
    const widget = getWidgetById(widgetId)
    if (!widget) return

    showAddDialog.value = false

    if (widget.metadata.requiresConfig) {
        selectedWidgetForConfig.value = widget
        showConfigDialog.value = true
    } else {
        addWidget(widgetId, widget.metadata)
    }
}

function handleConfigSave(config: Record<string, any>) {
    if (selectedWidgetForConfig.value) {
        addWidget(selectedWidgetForConfig.value.id, selectedWidgetForConfig.value.metadata, config)
        selectedWidgetForConfig.value = null
    }
}

/**
 * Handle remove widget
 */
function handleRemoveWidget(widgetId: string): void {
    removeWidget(widgetId)
}

/**
 * Handle reset layout
 */
function handleResetLayout(): void {
    resetLayout()
}

/**
 * Open add widget dialog
 */
function openAddDialog(): void {
    showAddDialog.value = true
}

/**
 * Get widget component by ID
 */
function getWidgetComponent(widgetId: string): IWidgetComponent['component'] | undefined {
    const widget = getWidgetById(widgetId)
    return widget?.component
}
</script>

<template>
    <div class="widget-dashboard">
        <!-- Header with actions -->
        <div class="dashboard-header flex items-center justify-between mb-4 gap-3">
            <div class="flex items-center gap-3">
                <ToggleButton
                    v-model="isEditing"
                    :onLabel="t('common.widgets.done_editing')"
                    :offLabel="t('common.widgets.edit_layout')"
                    onIcon="pi pi-check"
                    offIcon="pi pi-pencil"
                    class="w-36"
                    size="small"
                />

                <template v-if="isEditing">
                    <Button
                        :label="t('common.widgets.add_widget')"
                        icon="pi pi-plus"
                        severity="success"
                        size="small"
                        @click="openAddDialog"
                    />
                    <Button
                        :label="t('common.widgets.reset_layout')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="handleResetLayout"
                    />
                </template>
            </div>
            <div class="text-sm text-surface-500">
                <!-- {{ widgetIds.length }} {{ t('common.widgets.title').toLowerCase() }} -->
            </div>
        </div>

        <!-- Grid Layout -->
        <div v-if="layout.length > 0" class="grid-container">
            <GridLayout
                :layout="layout"
                :col-num="colNum"
                :row-height="rowHeight"
                :is-draggable="isDraggable"
                :is-resizable="isResizable"
                :vertical-compact="true"
                :use-css-transforms="true"
                :responsive="true"
                @update:layout="handleLayoutUpdate"
            >
                <GridItem
                    v-for="item in layout"
                    :key="item.i"
                    :x="item.x"
                    :y="item.y"
                    :w="item.w"
                    :h="item.h"
                    :i="item.i"
                    :min-w="item.minW"
                    :min-h="item.minH"
                    :max-w="item.maxW"
                    :max-h="item.maxH"
                    class="widget-grid-item"
                >
                    <div
                        class="widget-wrapper h-full flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden"
                        :class="[
                            isEditing ? 'border-dashed border-primary-300' : 'border-transparent'
                        ]"
                    >
                        <!-- Widget header with remove button (Only in Edit Mode) -->
                        <div
                            v-if="isEditing"
                            class="widget-header flex items-center justify-between px-3 py-2 bg-surface-50 border-b border-surface-200"
                        >
                            <div
                                class="widget-drag-handle flex-1 cursor-move flex items-center gap-2"
                            >
                                <i class="pi pi-bars text-surface-400 text-xs"></i>
                                <span class="text-sm font-medium text-surface-700">
                                    {{ getWidgetById(item.i)?.metadata.title }}
                                </span>
                            </div>
                            <Button
                                icon="pi pi-times"
                                text
                                rounded
                                severity="danger"
                                size="small"
                                class="widget-remove-btn"
                                @click="handleRemoveWidget(item.i)"
                            />
                        </div>

                        <!-- Widget content -->
                        <div class="widget-content flex-1 overflow-auto p-3 relative h-full">
                            <!-- Overlay to prevent interaction in Edit Mode -->
                            <div
                                v-if="isEditing"
                                class="absolute inset-0 z-10 bg-white/10 cursor-move"
                            ></div>
                            <component
                                :is="getWidgetComponent(item.i)"
                                v-if="getWidgetComponent(item.i)"
                                :config="item.config"
                            />
                            <div
                                v-else
                                class="flex items-center justify-center h-full text-surface-400"
                            >
                                Widget not found
                            </div>
                        </div>
                    </div>
                </GridItem>
            </GridLayout>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state flex flex-col items-center justify-center py-16 text-center">
            <i class="pi pi-th-large text-6xl text-surface-300 mb-4"></i>
            <p class="text-surface-500 mb-4">
                {{ t('common.widgets.no_widgets') }}
            </p>
            <Button
                :label="t('common.widgets.add_widget')"
                icon="pi pi-plus"
                severity="success"
                @click="openAddDialog"
            />
        </div>

        <!-- Add Widget Dialog -->
        <Dialog
            v-model:visible="showAddDialog"
            :header="t('common.widgets.select_widget')"
            :modal="true"
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        >
            <div class="p-4 space-y-4">
                <!-- Category selector -->
                <div class="flex items-center gap-3">
                    <Select
                        v-model="selectedCategory"
                        :options="categoryOptions"
                        option-label="label"
                        option-value="value"
                        :placeholder="t('common.widgets.select_category')"
                        class="min-w-[200px]"
                        size="small"
                    />
                    <span class="text-xs text-surface-500">
                        {{ availableWidgetsToAdd.length }} {{ t('common.widgets.available') }}
                    </span>
                </div>

                <!-- Widgets list grouped by category filter -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    <Card
                        v-for="widget in availableWidgetsToAdd"
                        :key="widget.id"
                        class="cursor-pointer hover:shadow-lg transition-shadow"
                        @click="handleAddWidget(widget.id)"
                    >
                        <template #header>
                            <div class="flex items-center gap-3 p-4">
                                <i
                                    v-if="widget.metadata.icon"
                                    :class="widget.metadata.icon"
                                    class="text-2xl text-primary-500"
                                ></i>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold">
                                        {{ widget.metadata.title }}
                                    </h3>
                                    <p
                                        v-if="widget.metadata.description"
                                        class="text-sm text-surface-500 mt-1"
                                    >
                                        {{ widget.metadata.description }}
                                    </p>
                                </div>
                            </div>
                        </template>
                        <template #content>
                            <div
                                class="flex items-center justify-between px-4 pb-3 text-xs text-surface-400"
                            >
                                <span class="font-medium capitalize">
                                    {{ String(widget.metadata.category) }}
                                </span>
                                <span>
                                    {{ widget.metadata.defaultSize.w }}x{{
                                        widget.metadata.defaultSize.h
                                    }}
                                </span>
                            </div>
                        </template>
                    </Card>

                    <div
                        v-if="availableWidgetsToAdd.length === 0"
                        class="col-span-full text-center py-8 text-surface-500"
                    >
                        {{ t('common.widgets.no_available') }}
                    </div>
                </div>
            </div>
        </Dialog>


        <!-- Widget Config Dialog -->
        <WidgetConfigDialog
            v-if="selectedWidgetForConfig"
            v-model:visible="showConfigDialog"
            :widget="selectedWidgetForConfig"
            :context="context"
            @save="handleConfigSave"
        />
    </div>
</template>

<style scoped>
.widget-dashboard {
    width: 100%;
}

.grid-container {
    min-height: 400px;
}

/* Add grid background in edit mode */
.grid-container:has(.vue-grid-item.vue-grid-placeholder) {
    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
    background-size: 20px 20px;
}

.widget-grid-item {
    touch-action: none;
}

.widget-wrapper {
    position: relative;
    height: 100%;
}

.widget-drag-handle {
    user-select: none;
}

.widget-content {
    position: relative;
}
</style>
