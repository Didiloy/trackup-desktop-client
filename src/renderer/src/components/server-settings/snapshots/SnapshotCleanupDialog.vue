<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'

const props = defineProps<{
    visible: boolean
    serverId: string
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'cleaned', count: number): void
}>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStatsStore()

const daysOld = ref(30)
const isCleaning = ref(false)

const handleCleanup = async () => {
    isCleaning.value = true
    try {
        const res = await snapshotStore.cleanupSnapshots(props.serverId, {
            days: daysOld.value
        })

        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('views.server_settings.snapshots.cleanup.error'),
                life: 3000
            })
        } else {
            const count = res.data?.count || 0
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('views.server_settings.snapshots.cleanup.success', { count }),
                life: 3000
            })
            emit('cleaned', count)
            emit('update:visible', false)
        }
    } finally {
        isCleaning.value = false
    }
}

const onHide = () => {
    daysOld.value = 30
}
</script>

<template>
    <AppDialog :model-value="visible" @update:model-value="emit('update:visible', $event)" @hide="onHide">
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

        <div class="flex flex-col gap-6 p-6">
            <!-- Warning message -->
            <Message severity="warn" :closable="false">
                {{ t('views.server_settings.snapshots.cleanup.warning') }}
            </Message>

            <!-- Days input -->
            <div class="flex flex-col gap-2">
                <label for="days-old" class="font-medium text-surface-900">
                    {{ t('views.server_settings.snapshots.cleanup.days_label') }}
                </label>
                <div class="flex items-center gap-2">
                    <InputNumber
                        id="days-old"
                        v-model="daysOld"
                        :min="1"
                        :max="365"
                        class="w-32"
                    />
                    <span class="text-surface-600">
                        {{ t('views.server_settings.snapshots.cleanup.days_unit') }}
                    </span>
                </div>
            </div>

            <!-- Info message -->
            <Message severity="info" :closable="false">
                {{ t('views.server_settings.snapshots.cleanup.confirm') }}
            </Message>
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
                    :label="t('views.server_settings.snapshots.cleanup.submit')"
                    severity="danger"
                    :loading="isCleaning"
                    @click="handleCleanup"
                />
            </div>
        </template>
    </AppDialog>
</template>
