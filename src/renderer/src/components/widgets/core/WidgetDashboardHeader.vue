<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

defineProps<{
    isEditing: boolean
    widgetCount?: number
}>()

const emit = defineEmits<{
    (e: 'update:isEditing', value: boolean): void
    (e: 'add'): void
    (e: 'reset'): void
}>()

const { t } = useI18n()
</script>

<template>
    <div class="sticky top-0 z-10 px-6 py-4 mb-6 backdrop-blur-xl bg-surface-0/85 border-b border-surface-200/60 transition-all duration-300 hover:bg-surface-0/95 hover:border-surface-200/80">
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <Button
                    :label="isEditing ? t('common.widgets.done_editing') : t('common.widgets.edit_layout')"
                    :icon="isEditing ? 'pi pi-check' : 'pi pi-pencil'"
                    :severity="isEditing ? 'success' : 'secondary'"
                    size="small"
                    class="min-w-[140px]"
                    @click="emit('update:isEditing', !isEditing)"
                />

                <template v-if="isEditing">
                    <Button
                        :label="t('common.widgets.add_widget')"
                        icon="pi pi-plus"
                        severity="success"
                        size="small"
                        class="min-w-[140px]"
                        @click="emit('add')"
                    />
                    <Button
                        :label="t('common.widgets.reset_layout')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        class="min-w-[140px]"
                        @click="emit('reset')"
                    />
                </template>
            </div>

            <div 
                v-if="widgetCount !== undefined" 
                class="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-primary-500/10 to-primary-600/15 border border-primary-500/20 text-primary-700 text-sm transition-all duration-300 hover:from-primary-500/15 hover:to-primary-600/20 hover:border-primary-500/30 hover:-translate-y-0.5"
            >
                <i class="pi pi-th-large text-primary-600"></i>
                <span class="font-medium">{{ widgetCount }}</span>
                <span class="opacity-80">{{ t('common.widgets.title') }}</span>
            </div>
        </div>
    </div>
</template>
