<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStore } from '@/stores/snapshot'
import { useSnapshot } from '@/composables/snapshots/useSnapshot'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { SnapshotType } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import SnapshotIcon from '@/components/common/icons/SnapshotIcon.vue'

interface Props {
    visible: boolean
    serverId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'created'): void
}>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()
const { typeCreateOptions } = useSnapshot()

// Form state
const form = ref({
    type: 'milestone' as SnapshotType,
    title: '',
    description: ''
})

const isSubmitting = ref(false)

const isFormValid = computed(() => {
    return form.value.title.trim().length > 0
})

const handleSubmit = async (): Promise<void> => {
    isSubmitting.value = true
    try {
        const res = await snapshotStore.create_snapshot(props.serverId, {
            type: form.value.type,
            title: form.value.title || undefined,
            description: form.value.description || undefined
        })

        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('messages.error.create'),
                life: 3000
            })
        } else {
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('messages.success.create'),
                life: 3000
            })
            emit('created')
            closeDialog()
        }
    } finally {
        isSubmitting.value = false
    }
}

const resetForm = (): void => {
    form.value = {
        type: 'milestone',
        title: '',
        description: ''
    }
}

const closeDialog = (): void => {
    emit('update:visible', false)
    resetForm()
}

const handleHide = (): void => {
    resetForm()
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        @update:model-value="emit('update:visible', $event)"
        @hide="handleHide"
    >
        <template #header>
            <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold text-surface-900">
                    <SnapshotIcon class="text-primary-600 mr-2" />
                    {{ t('views.server_settings.snapshots.actions.create') }}
                </h2>
                <p class="text-sm text-surface-500 truncate">
                    {{ t('views.server_settings.snapshots.description') }}
                </p>
            </div>
        </template>

        <div class="flex flex-col gap-5 p-6">
            <!-- Title -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-title" class="font-medium text-surface-900">
                    {{ t('common.fields.title') }}
                    <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="snapshot-title"
                    v-model="form.title"
                    :placeholder="t('views.server_settings.snapshots.title_placeholder')"
                    class="w-full"
                />
            </div>

            <!-- Type selector -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-type" class="font-medium text-surface-900">
                    {{ t('common.fields.type') }}
                    <span class="text-red-500">*</span>
                </label>
                <Select
                    id="snapshot-type"
                    v-model="form.type"
                    :options="typeCreateOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-description" class="font-medium text-surface-900">
                    {{ t('common.fields.description') }}
                </label>
                <Textarea
                    id="snapshot-description"
                    v-model="form.description"
                    :placeholder="t('common.fields.description')"
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-6 pt-0">
                <Button
                    :label="t('common.actions.cancel')"
                    severity="secondary"
                    outlined
                    :disabled="isSubmitting"
                    @click="closeDialog"
                />
                <Button
                    :label="t('common.actions.create')"
                    :loading="isSubmitting"
                    :disabled="!isFormValid"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </AppDialog>
</template>
