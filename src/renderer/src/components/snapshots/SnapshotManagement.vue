<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnapshotStore } from '@/stores/snapshot'
import SnapshotList from './SnapshotList.vue'
import SnapshotCreateDialog from './SnapshotCreateDialog.vue'
import SnapshotCompareDialog from './SnapshotCompareDialog.vue'
import SnapshotCleanupDialog from './SnapshotCleanupDialog.vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import SnapshotIcon from '@/components/common/icons/SnapshotIcon.vue'

interface Props {
    serverId: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const snapshotStore = useSnapshotStore()

// Dialog visibility states
const isCreateDialogVisible = ref(false)
const isCompareDialogVisible = ref(false)
const isCleanupDialogVisible = ref(false)

// Reference to SnapshotList for refreshing
const snapshotListRef = ref<InstanceType<typeof SnapshotList> | null>(null)

const handleSnapshotCreated = async (): Promise<void> => {
    await snapshotStore.fetch_summary(props.serverId)
    snapshotListRef.value?.refresh()
}

const handleSnapshotsCleaned = async (): Promise<void> => {
    await snapshotStore.fetch_summary(props.serverId)
    snapshotListRef.value?.refresh()
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between">
                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold text-surface-900">
                        <SnapshotIcon class="text-primary-600 mr-2" />
                        {{ t('views.server_settings.snapshots.title') }}
                    </h2>
                    <p class="text-surface-600 mt-1">
                        {{ t('views.server_settings.snapshots.description') }}
                    </p>
                </div>
                <div class="flex gap-2">
                    <Button
                        :label="t('views.server_settings.snapshots.actions.compare')"
                        icon="pi pi-chart-line"
                        severity="secondary"
                        outlined
                        @click="isCompareDialogVisible = true"
                    />
                    <Button
                        :label="t('views.server_settings.snapshots.actions.cleanup')"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        @click="isCleanupDialogVisible = true"
                    />
                    <Button
                        :label="t('common.actions.create')"
                        icon="pi pi-plus"
                        @click="isCreateDialogVisible = true"
                    />
                </div>
            </div>
        </div>

        <!-- List Section -->
        <SnapshotList ref="snapshotListRef" :server-id="serverId" />

        <!-- Dialogs -->
        <SnapshotCreateDialog
            v-model:visible="isCreateDialogVisible"
            :server-id="serverId"
            @created="handleSnapshotCreated"
        />
        <SnapshotCompareDialog v-model:visible="isCompareDialogVisible" :server-id="serverId" />
        <SnapshotCleanupDialog
            v-model:visible="isCleanupDialogVisible"
            :server-id="serverId"
            @cleaned="handleSnapshotsCleaned"
        />
    </div>
</template>
