<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

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
const showResetConfirm = ref(false)

function handleResetRequest(): void {
    showResetConfirm.value = true
}

function confirmReset(): void {
    emit('reset')
    showResetConfirm.value = false
}
</script>

<template>
    <div
        class="sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-200 p-4 m-3 rounded-2xl"
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
                        v-if="isEditing"
                        key="add-widget"
                        :label="t('common.widgets.add_widget')"
                        icon="pi pi-plus"
                        severity="primary"
                        size="small"
                        @click="emit('add')"
                    />
                    <Button
                        v-if="isEditing"
                        key="reset-layout"
                        :label="t('common.widgets.reset_layout')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="handleResetRequest"
                    />
                </template>
            </div>
        </div>

        <ConfirmationDialog
            v-model="showResetConfirm"
            :title="t('common.widgets.reset_layout')"
            :message="t('common.widgets.reset_layout_confirm')"
            :confirm-label="t('common.widgets.reset_layout')"
            confirm-severity="danger"
            @confirm="confirmReset"
        />
    </div>
</template>
