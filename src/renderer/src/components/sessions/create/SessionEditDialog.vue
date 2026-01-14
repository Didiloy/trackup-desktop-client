<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import SessionCreateEditForm from '@/components/sessions/create/SessionCreateEditForm.vue'
import type { ISession } from '@shared/contracts/interfaces/entities/session.interfaces'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'

defineProps<{
    modelValue: boolean
    session: ISession | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'updated', session: ISession): void
}>()

const { t } = useI18n()

function onClose(): void {
    emit('update:modelValue', false)
}

function onSuccess(updatedSession: ISession): void {
    emit('updated', updatedSession)
    onClose()
}
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] max-h-[90vh] flex flex-col'"
        :content-class="'overflow-y-auto p-0 flex-1'"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #header>
            <div
                class="flex items-center gap-3 p-4 text-xl font-bold text-surface-900 border-b border-surface-200"
            >
                <SessionIcon class="w-6 h-6 text-primary-500" />
                <span
                    >{{ t('common.actions.edit') }}
                    {{ t('views.server_sessions.title_single').toLowerCase() }}</span
                >
            </div>
        </template>

        <div v-if="session" class="px-6 py-6">
            <SessionCreateEditForm
                :initial-session="session"
                @success="onSuccess"
                @cancel="onClose"
            />
        </div>
    </AppDialog>
</template>
