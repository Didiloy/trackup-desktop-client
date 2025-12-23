<script setup lang="ts">
import { GridLayout, GridItem } from 'grid-layout-plus'
import type {
    IWidgetLayoutItem,
    IWidgetComponent
} from '@shared/contracts/interfaces/widget.interfaces'
import WidgetGridItem from './WidgetGridItem.vue'

defineProps<{
    layout: IWidgetLayoutItem[]
    isEditing: boolean
    colNum: number
    rowHeight: number
    getWidgetById: (id: string) => IWidgetComponent | undefined
}>()

const emit = defineEmits<{
    (e: 'update:layout', newLayout: IWidgetLayoutItem[]): void
    (e: 'remove', widgetId: string): void
}>()
</script>

<template>
    <div class="grid-container" :class="{ 'is-editing': isEditing }">
        <GridLayout
            :layout="layout"
            :use-css-transforms="true"
            :vertical-compact="true"
            :is-resizable="isEditing"
            :is-draggable="isEditing"
            :row-height="rowHeight"
            :col-num="colNum"
            @update:layout="emit('update:layout', $event)"
        >
            <GridItem v-for="item in layout" :key="item.i" v-bind="item" class="widget-grid-item">
                <WidgetGridItem
                    :widget="getWidgetById(item.i)"
                    :is-editing="isEditing"
                    :config="item.config"
                    @remove="emit('remove', item.i)"
                />
            </GridItem>
        </GridLayout>
    </div>
</template>

<style scoped>
.grid-container {
    min-height: 400px;
}

.grid-container.is-editing {
    background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
    background-size: 20px 20px;
    background-color: #f8fafc;
    border-radius: 1rem;
    padding: 1rem;
    transition: all 0.3s ease;
}

.widget-grid-item {
    touch-action: none;
}
</style>
