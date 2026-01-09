<script setup lang="ts">
import { ref } from 'vue'
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
                detail: t('views.server_settings.snapshots.create.error'),
                life: 3000
            })
        } else {
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('views.server_settings.snapshots.create.success'),
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
                    {{ t('views.server_settings.snapshots.create.title') }}
                </h2>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_settings.snapshots.create.description') }}
                </p>
            </div>
        </template>

        <div class="flex flex-col gap-5 p-6">
            <!-- Type selector -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-type" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.create.type_label') }}
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

            <!-- Title -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-title" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.create.title_label') }}
                </label>
                <InputText
                    id="snapshot-title"
                    v-model="form.title"
                    :placeholder="t('views.server_settings.snapshots.create.title_placeholder')"
                    class="w-full"
                />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-description" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.create.description_label') }}
                </label>
                <Textarea
                    id="snapshot-description"
                    v-model="form.description"
                    :placeholder="
                        t('views.server_settings.snapshots.create.description_placeholder')
                    "
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
                    :label="t('views.server_settings.snapshots.create.submit')"
                    :loading="isSubmitting"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </AppDialog>
</template>
