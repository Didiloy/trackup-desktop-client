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
            @layout-updated="emit('update:layout', $event)"
        >
            <GridItem v-for="item in layout" :key="item.i" v-bind="item" class="widget-grid-item">
                <WidgetGridItem
                    :widget="getWidgetById(item.i.split('-').slice(0, -2).join('-'))"
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
    padding: 0;
    border-radius: 0;
    background-image: none;
    background-size: 20px 20px;
    transition:
        padding 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        background-image 0.4s ease;
}

.grid-container.is-editing {
    background-image: radial-gradient(circle, #e2e8f0 2px, transparent 1px);
    border-radius: 2rem;
    padding: 1rem;
}

.widget-grid-item {
    touch-action: none;
}
</style>
