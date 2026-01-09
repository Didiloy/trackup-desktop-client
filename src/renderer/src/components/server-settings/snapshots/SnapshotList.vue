<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStore } from '@/stores/snapshot'
import { useSnapshotCRUD } from '@/composables/snapshots/useSnapshotCRUD'
import SnapshotDetailDialog from './SnapshotDetailDialog.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import type {
    SnapshotType,
    ISnapshotLight
} from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

interface Props {
    serverId: string
}

const props = defineProps<Props>()

const { t, d } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()
const { getSnapshotById } = useSnapshotCRUD()

// Filter state
const selectedType = ref<SnapshotType | 'all'>('all')

// Dialog state
const isDetailDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const snapshotToDelete = ref<string | null>(null)

// Type filter options
const typeFilterOptions = computed(() => [
    { label: t('views.server_settings.snapshots.list.all_types'), value: 'all' },
    { label: t('views.server_settings.snapshots.types.daily'), value: 'daily' },
    { label: t('views.server_settings.snapshots.types.weekly'), value: 'weekly' },
    { label: t('views.server_settings.snapshots.types.monthly'), value: 'monthly' },
    { label: t('views.server_settings.snapshots.types.yearly'), value: 'yearly' },
    { label: t('views.server_settings.snapshots.types.milestone'), value: 'milestone' },
    { label: t('views.server_settings.snapshots.types.custom'), value: 'custom' }
])

// Pagination state
const currentPage = ref(0)
const rowsPerPage = ref(10)

// Fetch snapshots function
const fetchSnapshots = async (): Promise<void> => {
    const params: { page: number; limit: number; type?: SnapshotType } = {
        page: currentPage.value + 1,
        limit: rowsPerPage.value
    }
    if (selectedType.value !== 'all') {
        params.type = selectedType.value
    }
    await snapshotStore.fetchSnapshots(props.serverId, params)
}

// Watch for filter changes
watch(selectedType, () => {
    currentPage.value = 0
    fetchSnapshots()
})

// Initial load
onMounted(() => {
    fetchSnapshots()
})

// Format date for display
const formatDate = (date: string): string => {
    return d(new Date(date), 'short')
}

// Get type label
const getTypeLabel = (type: SnapshotType): string => {
    return t(`views.server_settings.snapshots.types.${type}`)
}

// Get type severity for badge
const getTypeSeverity = (
    type: SnapshotType
): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined => {
    const severityMap: Record<SnapshotType, 'info' | 'success' | 'warn' | 'danger' | 'secondary'> = {
        daily: 'info',
        weekly: 'success',
        monthly: 'warn',
        yearly: 'secondary',
        milestone: 'danger',
        custom: 'secondary'
    }
    return severityMap[type]
}

// Handle row click - show detail dialog
const handleRowClick = async (event: { data: ISnapshotLight }): Promise<void> => {
    const snapshot = event.data
    const res = await snapshotStore.fetchSnapshotById(props.serverId, snapshot.id)
    if (!res.error && res.data) {
        isDetailDialogVisible.value = true
    } else {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.detail.load_error'),
            life: 3000
        })
    }
}

// Handle download
const handleDownload = async (snapshot: ISnapshotLight): Promise<void> => {
    try {
        const res = await getSnapshotById(props.serverId, snapshot.id)
        if (res.error || !res.data) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('views.server_settings.snapshots.download.error'),
                life: 3000
            })
            return
        }

        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `snapshot-${res.data.title ?? res.data.type}-${new Date(res.data.snapshot_date).toLocaleDateString()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('views.server_settings.snapshots.download.success'),
            life: 3000
        })
    } catch {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.download.error'),
            life: 3000
        })
    }
}

// Handle delete request
const handleDeleteRequest = (snapshot: ISnapshotLight): void => {
    snapshotToDelete.value = snapshot.id
    isDeleteDialogVisible.value = true
}

// Confirm delete
const confirmDelete = async (): Promise<void> => {
    if (!snapshotToDelete.value) return

    const res = await snapshotStore.deleteSnapshot(props.serverId, snapshotToDelete.value)
    if (res.error) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.delete.error'),
            life: 3000
        })
    } else {
        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('views.server_settings.snapshots.delete.success'),
            life: 3000
        })
        await fetchSnapshots()
    }

    snapshotToDelete.value = null
}

// Handle page change
const handlePage = (event: { page: number; rows: number }): void => {
    currentPage.value = event.page
    rowsPerPage.value = event.rows
    fetchSnapshots()
}

// Expose refetch for parent component
defineExpose({ fetchSnapshots })
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Header with filter -->
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-surface-900">
                {{ t('views.server_settings.snapshots.list.title') }}
            </h3>
            <Select
                v-model="selectedType"
                :options="typeFilterOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('views.server_settings.snapshots.list.filter_by_type')"
                class="w-56"
            />
        </div>

        <!-- Snapshot table -->
        <DataTable
            :value="snapshotStore.snapshots"
            :loading="snapshotStore.isLoading"
            :paginator="true"
            :rows="rowsPerPage"
            :total-records="snapshotStore.pagination.total"
            :lazy="true"
            :first="currentPage * rowsPerPage"
            :rows-per-page-options="[5, 10, 20]"
            data-key="id"
            striped-rows
            hover
            class="cursor-pointer"
            @row-click="handleRowClick"
            @page="handlePage"
        >
            <!-- Empty message -->
            <template #empty>
                <div class="text-center py-8 text-surface-500">
                    <i class="pi pi-camera text-4xl mb-3 block"></i>
                    {{ t('views.server_settings.snapshots.list.empty') }}
                </div>
            </template>

            <!-- Title column -->
            <Column field="title" :header="t('views.server_settings.snapshots.columns.title')" style="width: 25%">
                <template #body="{ data }">
                    <span class="font-medium text-surface-900">
                        {{ data.title || getTypeLabel(data.type) }}
                    </span>
                </template>
            </Column>

            <!-- Description column -->
            <Column field="description" :header="t('views.server_settings.snapshots.columns.description')" style="width: 30%">
                <template #body="{ data }">
                    <span class="text-surface-600 line-clamp-1">
                        {{ data.description || '-' }}
                    </span>
                </template>
            </Column>

            <!-- Type column -->
            <Column field="type" :header="t('views.server_settings.snapshots.columns.type')" style="width: 15%">
                <template #body="{ data }">
                    <Badge :value="getTypeLabel(data.type)" :severity="getTypeSeverity(data.type)" />
                </template>
            </Column>

            <!-- Date column -->
            <Column field="created_at" :header="t('views.server_settings.snapshots.columns.date')" style="width: 15%">
                <template #body="{ data }">
                    <span class="text-surface-600">{{ formatDate(data.created_at) }}</span>
                </template>
            </Column>

            <!-- Actions column -->
            <Column :header="t('views.server_settings.snapshots.columns.actions')" style="width: 15%">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button
                            icon="pi pi-download"
                            text
                            rounded
                            size="small"
                            severity="info"
                            v-tooltip.top="t('views.server_settings.snapshots.actions.download')"
                            @click.stop="handleDownload(data)"
                        />
                        <Button
                            icon="pi pi-trash"
                            text
                            rounded
                            size="small"
                            severity="danger"
                            v-tooltip.top="t('views.server_settings.snapshots.actions.delete')"
                            @click.stop="handleDeleteRequest(data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Detail Dialog -->
        <SnapshotDetailDialog
            v-model:visible="isDetailDialogVisible"
            :snapshot="snapshotStore.currentSnapshot"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmationDialog
            v-model="isDeleteDialogVisible"
            :title="t('views.server_settings.snapshots.delete.confirm_title')"
            :message="t('views.server_settings.snapshots.delete.confirm_message')"
            :on-confirm="confirmDelete"
        />
    </div>
</template>
