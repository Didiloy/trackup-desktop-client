<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'

const props = defineProps<{
    isEditing: boolean
    widgetCount?: number
    isDirty?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:isEditing', value: boolean): void
    (e: 'add'): void
    (e: 'reset'): void
    (e: 'cancel'): void
    (e: 'done'): void
}>()

const { t } = useI18n()
const showResetConfirm = ref(false)
const showCancelConfirm = ref(false)

function handleResetRequest(): void {
    showResetConfirm.value = true
}

function confirmReset(): void {
    emit('reset')
    showResetConfirm.value = false
}

function handleCancelRequest(): void {
    if (props.isDirty) {
        showCancelConfirm.value = true
    } else {
        emit('cancel')
    }
}

function confirmCancel(): void {
    emit('cancel')
    showCancelConfirm.value = false
}
</script>

<template>
    <div
        class="sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-200 p-4 m-3 rounded-2xl"
    >
        <div class="flex items-center justify-between w-full h-12 px-2 pt-4">
            <h2 class="text-2xl font-bold">
                {{ t('widgets.ui.dashboard') }}
                <span v-if="widgetCount !== undefined" class="text-surface-500 text-lg ml-2">
                    ({{ widgetCount + ' ' + t('widgets.ui.title') }})
                </span>
            </h2>
            <div class="flex items-center gap-2">
                <Button
                    v-if="!isEditing"
                    :label="t('widgets.ui.edit_layout')"
                    icon="pi pi-pencil"
                    severity="secondary"
                    size="small"
                    @click="emit('update:isEditing', true)"
                />
                <Button
                    v-else
                    :label="t('widgets.ui.done_editing')"
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    @click="emit('done')"
                />
                <template v-if="isEditing">
                    <Button
                        v-if="isEditing"
                        key="add-widget"
                        :label="t('widgets.ui.add_widget')"
                        icon="pi pi-plus"
                        severity="primary"
                        size="small"
                        @click="emit('add')"
                    />
                    <Button
                        v-if="isEditing"
                        key="reset-layout"
                        :label="t('widgets.ui.reset_layout')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="handleResetRequest"
                    />
                    <Button
                        v-if="isEditing"
                        key="cancel-editing"
                        :label="t('common.actions.cancel')"
                        icon="pi pi-times"
                        severity="danger"
                        outlined
                        size="small"
                        @click="handleCancelRequest"
                    />
                </template>
            </div>
        </div>

        <ConfirmationDialog
            v-model="showResetConfirm"
            :title="t('widgets.ui.reset_layout')"
            :message="t('widgets.ui.reset_layout_confirm')"
            :confirm-label="t('widgets.ui.reset_layout')"
            confirm-severity="danger"
            @confirm="confirmReset"
        />

        <ConfirmationDialog
            v-model="showCancelConfirm"
            :title="t('widgets.ui.discard_changes')"
            :message="t('widgets.ui.discard_changes_confirm')"
            :confirm-label="t('widgets.ui.discard_changes')"
            confirm-severity="danger"
            @confirm="confirmCancel"
        />
    </div>
</template>
