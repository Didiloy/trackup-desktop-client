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
    <div
        class="sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-200 p-4 m-3"
    >
        <div class="flex items-center justify-between w-full h-12 px-2 pt-4">
            <h2 class="text-2xl font-bold">
                {{ t('common.widgets.dashboard') }}
                <span v-if="widgetCount !== undefined" class="text-surface-500 text-lg ml-2">
                    ({{ widgetCount + ' ' + t('common.widgets.title') }})
                </span>
            </h2>
            <div class="flex items-center gap-2">
                <Button
                    :label="
                        isEditing
                            ? t('common.widgets.done_editing')
                            : t('common.widgets.edit_layout')
                    "
                    :icon="isEditing ? 'pi pi-check' : 'pi pi-pencil'"
                    :severity="isEditing ? 'success' : 'secondary'"
                    size="small"
                    @click="emit('update:isEditing', !isEditing)"
                />

                <template v-if="isEditing">
                    <Button
                        :label="t('common.widgets.add_widget')"
                        icon="pi pi-plus"
                        severity="success"
                        size="small"
                        @click="emit('add')"
                    />
                    <Button
                        :label="t('common.widgets.reset_layout')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="emit('reset')"
                    />
                </template>
            </div>
        </div>
    </div>
</template>
