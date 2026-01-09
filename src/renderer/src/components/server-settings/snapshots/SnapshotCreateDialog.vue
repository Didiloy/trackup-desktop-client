<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { SnapshotType } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

const props = defineProps<{
    visible: boolean
    serverId: string
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'created'): void
}>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStatsStore()

const selectedType = ref<SnapshotType>('milestone')
const title = ref('')
const description = ref('')
const isCreating = ref(false)

const typeOptions = [
    { label: t('views.server_settings.snapshots.types.milestone'), value: 'milestone' },
    { label: t('views.server_settings.snapshots.types.custom'), value: 'custom' }
]

const handleCreate = async () => {
    isCreating.value = true
    try {
        const res = await snapshotStore.createSnapshot(props.serverId, {
            type: selectedType.value,
            title: title.value || undefined,
            description: description.value || undefined
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
            emit('update:visible', false)
            resetForm()
        }
    } finally {
        isCreating.value = false
    }
}

const resetForm = () => {
    selectedType.value = 'milestone'
    title.value = ''
    description.value = ''
}

const onHide = () => {
    resetForm()
}
</script>

<template>
    <AppDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" @hide="onHide">
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

        <div class="flex flex-col gap-6 p-6">
            <!-- Type selector -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-type" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.create.type_label') }}
                </label>
                <Select
                    id="snapshot-type"
                    v-model="selectedType"
                    :options="typeOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                />
            </div>

            <!-- Title -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-title" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.title_label') }}
                </label>
                <InputText
                    id="snapshot-title"
                    v-model="title"
                    :placeholder="t('views.server_settings.snapshots.title_placeholder')"
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
                    v-model="description"
                    :placeholder="t('views.server_settings.snapshots.create.description_placeholder')"
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 p-6">
                <Button
                    :label="t('common.actions.cancel')"
                    severity="secondary"
                    outlined
                    @click="emit('update:visible', false)"
                />
                <Button
                    :label="t('views.server_settings.snapshots.create.submit')"
                    :loading="isCreating"
                    @click="handleCreate"
                />
            </div>
        </template>
    </AppDialog>
</template>
