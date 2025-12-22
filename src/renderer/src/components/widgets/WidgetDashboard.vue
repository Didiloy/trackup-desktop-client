<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useI18n } from 'vue-i18n'
import { useWidgets } from '@/composables/widgets/useWidgets'
import { useWidgetLayout } from '@/composables/widgets/useWidgetLayout'
import type { IWidgetLayoutItem } from '@shared/contracts/interfaces/widget.interfaces'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'

const props = defineProps<{
    context: 'server' | 'activity' | string
    entityId: string
}>()

const { t } = useI18n()
const { widgets, sortedWidgets, getWidgetById } = useWidgets(props.context)
const { layout, widgetIds, addWidget, removeWidget, updateLayout, resetLayout, hasWidget } =
    useWidgetLayout(props.context, props.entityId)

const showAddDialog = ref(false)
const isDraggable = ref(true)
const isResizable = ref(true)
const colNum = ref(12)
const rowHeight = ref(60)

/**
 * Available widgets that are not currently in the layout
 */
const availableWidgetsToAdd = computed(() => {
    return sortedWidgets.value.filter((widget) => !hasWidget(widget.id))
})

/**
 * Handle layout update from grid-layout-plus
 */
function handleLayoutUpdate(newLayout: IWidgetLayoutItem[]) {
    updateLayout(newLayout)
}

/**
 * Handle add widget
 */
function handleAddWidget(widgetId: string) {
    const widget = getWidgetById(widgetId)
    if (widget) {
        addWidget(widgetId, widget.metadata)
        showAddDialog.value = false
    }
}

/**
 * Handle remove widget
 */
function handleRemoveWidget(widgetId: string) {
    removeWidget(widgetId)
}

/**
 * Handle reset layout
 */
function handleResetLayout() {
    resetLayout()
}

/**
 * Open add widget dialog
 */
function openAddDialog() {
    showAddDialog.value = true
}

/**
 * Get widget component by ID
 */
function getWidgetComponent(widgetId: string) {
    const widget = getWidgetById(widgetId)
    return widget?.component
}
</script>

<template>
    <div class="widget-dashboard">
        <!-- Header with actions -->
        <div class="dashboard-header flex items-center justify-between mb-4 gap-3">
            <div class="flex items-center gap-3">
                <Button
                    :label="t('common.widgets.add_widget')"
                    icon="pi pi-plus"
                    @click="openAddDialog"
                    severity="success"
                    size="small"
                />
                <Button
                    :label="t('common.widgets.reset_layout')"
                    icon="pi pi-refresh"
                    @click="handleResetLayout"
                    severity="secondary"
                    outlined
                    size="small"
                />
            </div>
            <div class="text-sm text-surface-500">
                {{ widgetIds.length }} {{ t('common.widgets.title').toLowerCase() }}
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
                        class="widget-wrapper h-full flex flex-col bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden"
                    >
                        <!-- Widget header with remove button -->
                        <div
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
                                @click="handleRemoveWidget(item.i)"
                                class="widget-remove-btn"
                            />
                        </div>

                        <!-- Widget content -->
                        <div class="widget-content flex-1 overflow-auto p-3">
                            <component
                                :is="getWidgetComponent(item.i)"
                                v-if="getWidgetComponent(item.i)"
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
                @click="openAddDialog"
                severity="success"
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
                                <h3 class="text-lg font-semibold">{{ widget.metadata.title }}</h3>
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
                        <div class="text-xs text-surface-400">
                            {{ widget.metadata.defaultSize.w }}x{{ widget.metadata.defaultSize.h }}
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
        </Dialog>
    </div>
</template>

<style scoped>
.widget-dashboard {
    width: 100%;
}

.grid-container {
    min-height: 400px;
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

/* Grid layout styles */
:deep(.vue-grid-layout) {
    background-color: transparent;
}

:deep(.vue-grid-item) {
    transition: all 200ms ease;
    touch-action: none;
}

:deep(.vue-grid-item.resizing) {
    opacity: 0.9;
}

:deep(.vue-grid-item.static) {
    background-color: #cce;
}

:deep(.vue-grid-item .resizing) {
    opacity: 0.9;
}

:deep(.vue-grid-item .static) {
    background: #cce;
}

:deep(.vue-grid-item .text) {
    font-size: 24px;
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 100%;
    width: 100%;
}

:deep(.vue-grid-item .no-drag) {
    height: 100%;
    width: 100%;
}

:deep(.vue-grid-item .minMax) {
    font-size: 12px;
}

:deep(.vue-grid-item .add) {
    cursor: pointer;
}

:deep(.vue-draggable-handle) {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999'/></svg>")
        no-repeat;
    background-position: bottom right;
    padding: 0 8px 8px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: pointer;
}
</style>
