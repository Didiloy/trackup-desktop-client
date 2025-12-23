<script setup lang="ts">
import Button from 'primevue/button'
import type { IWidgetComponent } from '@shared/contracts/interfaces/widget.interfaces'

defineProps<{
    widget: IWidgetComponent | undefined
    isEditing: boolean
}>()

const emit = defineEmits<{
    (e: 'remove'): void
}>()
</script>

<template>
    <div
        class="widget-wrapper h-full flex flex-col transition-all duration-200"
        :class="[
            isEditing
                ? 'bg-white rounded-lg shadow-md border border-dashed border-primary-300 overflow-hidden'
                : 'bg-transparent border-none shadow-none'
        ]"
    >
        <!-- Widget header with remove button (Only in Edit Mode) -->
        <div
            v-if="isEditing"
            class="widget-header flex items-center justify-between px-3 py-2 bg-surface-50 border-b border-surface-200"
        >
            <div class="widget-drag-handle flex-1 cursor-move flex items-center gap-2">
                <i class="pi pi-bars text-surface-400 text-xs"></i>
                <span class="text-sm font-medium text-surface-700">
                    {{ widget?.metadata.title }}
                </span>
            </div>
            <Button
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                size="small"
                class="widget-remove-btn"
                @click="emit('remove')"
            />
        </div>

        <!-- Widget content -->
        <div
            class="widget-content flex-1 overflow-auto relative h-full"
            :class="[isEditing ? 'p-3' : 'p-0']"
        >
            <!-- Overlay to prevent interaction in Edit Mode -->
            <div v-if="isEditing" class="absolute inset-0 z-10 bg-white/10 cursor-move"></div>

            <component
                :is="widget.component"
                v-if="widget"
            />
            <div v-else class="flex items-center justify-center h-full text-surface-400">
                Widget not found
            </div>
        </div>
    </div>
</template>

<style scoped>
.widget-drag-handle {
    user-select: none;
}
.widget-content {
    position: relative;
}
</style>
