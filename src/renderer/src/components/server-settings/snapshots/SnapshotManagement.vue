<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import SnapshotSummary from './SnapshotSummary.vue'
import SnapshotList from './SnapshotList.vue'
import SnapshotCreateDialog from './SnapshotCreateDialog.vue'
import SnapshotCompareDialog from './SnapshotCompareDialog.vue'
import SnapshotCleanupDialog from './SnapshotCleanupDialog.vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

const props = defineProps<{
    serverId: string
}>()

const { t } = useI18n()
const snapshotStore = useSnapshotStatsStore()

const showCreateDialog = ref(false)
const showCompareDialog = ref(false)
const showCleanupDialog = ref(false)

const handleSnapshotCreated = async () => {
    // Refresh the summary and list after creating a snapshot
    await snapshotStore.fetchSummary(props.serverId)
    await snapshotStore.fetchSnapshots(props.serverId, { page: 1, limit: 10 })
}

const handleSnapshotsCleaned = async () => {
    // Refresh the list after cleanup
    await snapshotStore.fetchSnapshots(props.serverId, { page: 1, limit: 10 })
    await snapshotStore.fetchSummary(props.serverId)
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-surface-900">
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
                        @click="showCompareDialog = true"
                    />
                    <Button
                        :label="t('views.server_settings.snapshots.actions.cleanup')"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        @click="showCleanupDialog = true"
                    />
                    <Button
                        :label="t('views.server_settings.snapshots.actions.create')"
                        icon="pi pi-plus"
                        @click="showCreateDialog = true"
                    />
                </div>
            </div>
        </div>

        <Divider />

        <!-- Summary Section -->
        <SnapshotSummary :server-id="serverId" />

        <Divider />

        <!-- List Section -->
        <SnapshotList :server-id="serverId" />

        <!-- Dialogs -->
        <SnapshotCreateDialog
            v-model:visible="showCreateDialog"
            :server-id="serverId"
            @created="handleSnapshotCreated"
        />
        <SnapshotCompareDialog v-model:visible="showCompareDialog" :server-id="serverId" />
        <SnapshotCleanupDialog
            v-model:visible="showCleanupDialog"
            :server-id="serverId"
            @cleaned="handleSnapshotsCleaned"
        />
    </div>
</template>
