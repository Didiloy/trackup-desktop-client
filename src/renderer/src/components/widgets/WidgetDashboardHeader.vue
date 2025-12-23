<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'

defineProps<{
    isEditing: boolean
}>()

const emit = defineEmits<{
    (e: 'update:isEditing', value: boolean): void
    (e: 'add'): void
    (e: 'reset'): void
}>()

const { t } = useI18n()
</script>

<template>
    <div class="dashboard-header flex items-center justify-between mb-4 gap-3">
        <div class="flex items-center gap-3">
            <ToggleButton
                :model-value="isEditing"
                @update:model-value="emit('update:isEditing', $event)"
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
        <div class="text-sm text-surface-500">
            <!-- Header right content if needed -->
        </div>
    </div>
</template>
