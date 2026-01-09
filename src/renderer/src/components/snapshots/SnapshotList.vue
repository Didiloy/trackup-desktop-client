<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import { useSnapshotStore } from '@/stores/snapshot'
import { useSnapshot } from '@/composables/snapshots/useSnapshot'
import { usePaginatedFetcher } from '@/composables/usePaginatedFetcher'
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
import { formatDate } from '@/utils'

interface Props {
    serverId: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStore()
const { current_snapshot } = storeToRefs(snapshotStore)
const {
    typeFilterOptions,
    getTypeLabel,
    getTypeSeverity,
    downloadSnapshotWithFeedback,
    getSnapshotDisplayName
} = useSnapshot()

// Filter state
const selectedType = ref<SnapshotType | 'all'>('all')

// Dialog state
const isDetailDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const snapshotToDelete = ref<string | null>(null)

// Pagination & Data Fetching
const {
    items: snapshots,
    loading,
    total,
    page,
    goToPage,
    load
} = usePaginatedFetcher<ISnapshotLight>({
    fetcher: async ({ page, limit }) => {
        const res = await snapshotStore.fetch_snapshots(props.serverId, {
            page,
            limit,
            type: selectedType.value !== 'all' ? selectedType.value : undefined
        })

        if (res.error) {
            return { data: [], total: 0, error: res.error }
        }

        return {
            data: res.data?.data ?? [],
            total: res.data?.total ?? 0
        }
    },
    limit: 10,
    filters: [selectedType],
    mode: 'replace'
})

// Initial load
onMounted(() => {
    snapshotStore.init(props.serverId) // Init store (summary etc)
    load() // Load list
})

// Handle row click - show detail dialog
const handleRowClick = async (event: { data: ISnapshotLight }): Promise<void> => {
    const snapshot = event.data
    const res = await snapshotStore.fetch_snapshot_by_id(props.serverId, snapshot.id)
    if (!res.error && res.data) {
        isDetailDialogVisible.value = true
    } else {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('messages.error.fetch'),
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

    const res = await snapshotStore.delete_snapshot(props.serverId, snapshotToDelete.value)
    if (res.error) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('messages.error.delete'),
            life: 3000
        })
    } else {
        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('messages.success.delete'),
            life: 3000
        })
        // Reload current page to refresh list
        load()
    }

    snapshotToDelete.value = null
}

// Handle page change
const handlePage = (event: { page: number; rows: number }): void => {
    goToPage(event.page + 1)
}

// Expose refresh for parent component
defineExpose({ refresh: () => load() })
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
                :placeholder="t('placeholder.filter_by_type')"
                class="w-56"
            />
        </div>

        <!-- Snapshot table -->
        <DataTable
            :value="snapshots"
            :loading="loading"
            :paginator="true"
            :rows="10"
            :total-records="total"
            :lazy="true"
            :first="(page - 1) * 10"
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
                    {{ t('common.filters.no_results') }}
                </div>
            </template>

            <!-- Title column -->
            <Column
                field="title"
                :header="t('common.fields.title')"
                style="width: 25%"
            >
                <template #body="{ data }">
                    <span class="font-medium text-surface-900">
                        {{ getSnapshotDisplayName(data) }}
                    </span>
                </template>
            </Column>

            <!-- Description column -->
            <Column
                field="description"
                :header="t('common.fields.description')"
                style="width: 30%"
            >
                <template #body="{ data }">
                    <span class="text-surface-600 line-clamp-1">
                        {{ data.description || '-' }}
                    </span>
                </template>
            </Column>

            <!-- Type column -->
            <Column
                field="snapshot_type"
                :header="t('common.fields.type')"
                style="width: 15%"
            >
                <template #body="{ data }">
                    <Badge
                        :value="getTypeLabel(data.snapshot_type)"
                        :severity="getTypeSeverity(data.snapshot_type)"
                    />
                </template>
            </Column>

            <!-- Date column -->
            <Column
                field="snapshot_date"
                :header="t('common.fields.date')"
                style="width: 15%"
            >
                <template #body="{ data }">
                    <span class="text-surface-600">{{ formatDate(data.snapshot_date) }}</span>
                </template>
            </Column>

            <!-- Actions column -->
            <Column
                :header="t('common.actions.actions')"
                style="width: 15%"
            >
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button
                            icon="pi pi-download"
                            text
                            rounded
                            size="small"
                            severity="info"
                            v-tooltip.top="t('views.server_settings.snapshots.actions.download')"
                            @click.stop="downloadSnapshotWithFeedback(props.serverId, data.id)"
                        />
                        <Button
                            icon="pi pi-trash"
                            text
                            rounded
                            size="small"
                            severity="danger"
                            v-tooltip.top="t('common.actions.delete')"
                            @click.stop="handleDeleteRequest(data)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Detail Dialog -->
        <SnapshotDetailDialog
            v-model:visible="isDetailDialogVisible"
            :snapshot="current_snapshot"
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
