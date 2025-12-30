<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import type { IWidgetComponent } from '@shared/contracts/interfaces/widget.interfaces'

const { t } = useI18n()

defineProps<{
    widget: IWidgetComponent | undefined
    isEditing: boolean
    config?: any
}>()

const emit = defineEmits<{
    (e: 'remove'): void
}>()
</script>

<template>
    <div class="widget-wrapper h-full w-full relative">
        <!-- Widget content (always full size) -->
        <div class="widget-content h-full w-full">
            <component :is="widget.component" v-if="widget" :config="config" />
            <div v-else class="flex items-center justify-center h-full text-surface-400">-</div>
        </div>

        <!-- Edit mode overlay (on top of widget) -->
        <template v-if="isEditing">
            <!-- Border overlay (no pointer events) -->
            <div class="absolute inset-0 border-2 border-dashed border-primary-400 rounded-xl pointer-events-none z-10"></div>
            
            <!-- Header bar (with pointer events for buttons) -->
            <div
                class="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 bg-primary-500/90 backdrop-blur-sm rounded-t-xl z-20"
            >
                <div class="widget-drag-handle flex-1 cursor-move flex items-center gap-2">
                    <i class="pi pi-arrows-alt text-white text-xs"></i>
                    <span class="text-xs font-medium text-white truncate">
                        {{ widget?.metadata.title_key ? t(widget.metadata.title_key) : '' }}
                    </span>
                </div>
                <Button
                    icon="pi pi-times"
                    text
                    rounded
                    severity="danger"
                    size="small"
                    class="widget-remove-btn !text-white hover:!bg-white/20"
                    @click.stop="emit('remove')"
                />
            </div>

            <!-- Content blocker for drag (but leave space for resize handles) -->
            <div class="absolute inset-x-0 top-8 bottom-3 cursor-move z-10"></div>
        </template>
    </div>
</template>

<style scoped>
.widget-drag-handle {
    user-select: none;
}
</style>
