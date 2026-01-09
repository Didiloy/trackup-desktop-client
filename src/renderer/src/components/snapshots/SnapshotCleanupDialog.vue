<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStore } from '@/stores/snapshot'
import type { SnapshotType } from '@/../../shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'

interface Props {
    visible: boolean
    serverId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'cleaned', count: number): void
}>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()

const daysOld = ref(30)
const isSubmitting = ref(false)

const availableTypes = computed<{ label: string; value: SnapshotType }[]>(() => [
    { label: t('common.periods.daily'), value: 'daily' },
    { label: t('common.periods.weekly'), value: 'weekly' },
    { label: t('common.periods.monthly'), value: 'monthly' },
    { label: t('common.periods.yearly'), value: 'yearly' },
    { label: t('common.periods.milestone'), value: 'milestone' },
    { label: t('common.periods.custom'), value: 'custom' }
])

const selectedTypes = ref<SnapshotType[]>([
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'milestone',
    'custom'
])

const handleCleanup = async (): Promise<void> => {
    isSubmitting.value = true
    try {
        const res = await snapshotStore.cleanup_snapshots(props.serverId, {
            days: daysOld.value,
            include_types: selectedTypes.value.length > 0 ? selectedTypes.value : undefined
        })

        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('views.server_settings.snapshots.cleanup.error'),
                life: 3000
            })
        } else {
            const count = res.data?.count ?? 0
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('views.server_settings.snapshots.cleanup.success', { count }),
                life: 3000
            })
            emit('cleaned', count)
            closeDialog()
        }
    } finally {
        isSubmitting.value = false
    }
}

const closeDialog = (): void => {
    emit('update:visible', false)
}

const handleHide = (): void => {
    daysOld.value = 30
    selectedTypes.value = ['daily', 'weekly', 'monthly', 'yearly', 'milestone', 'custom']
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        style-class="w-full max-w-2xl"
        @update:model-value="emit('update:visible', $event)"
        @hide="handleHide"
    >
        <template #header>
            <div class="flex flex-col gap-1">
                <h2 class="text-xl font-bold text-surface-900">
                    {{ t('views.server_settings.snapshots.cleanup.title') }}
                </h2>
                <p class="text-sm text-surface-500">
                    {{ t('views.server_settings.snapshots.cleanup.description') }}
                </p>
            </div>
        </template>

        <div class="flex flex-col gap-5 p-6">
            <!-- Warning message -->
            <Message severity="warn" :closable="false">
                {{ t('views.server_settings.snapshots.cleanup.warning') }}
            </Message>

            <!-- Days input -->
            <div class="flex flex-col gap-2">
                <label for="days-old" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.cleanup.days_label') }}
                </label>
                <div class="flex items-center gap-10">
                    <InputNumber
                        id="days-old"
                        v-model="daysOld"
                        :min="1"
                        :max="365"
                        class="w-full"
                    />
                    <span class="text-surface-600">
                        {{ t('views.server_settings.snapshots.cleanup.days_unit') }}
                    </span>
                </div>
            </div>

            <!-- Snapshot types selection -->
            <div class="flex flex-col gap-2">
                <label for="snapshot-types" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.cleanup.types_label') }}
                </label>
                <MultiSelect
                    id="snapshot-types"
                    v-model="selectedTypes"
                    :options="availableTypes"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('views.server_settings.snapshots.cleanup.types_placeholder')"
                    class="w-full"
                    display="chip"
                />
                <span class="text-xs text-surface-500">
                    {{ t('views.server_settings.snapshots.cleanup.types_hint') }}
                </span>
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
                    :label="t('views.server_settings.snapshots.cleanup.submit')"
                    severity="danger"
                    :loading="isSubmitting"
                    @click="handleCleanup"
                />
            </div>
        </template>
    </AppDialog>
</template>
