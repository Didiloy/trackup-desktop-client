<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useSnapshotStatsStore } from '@/stores/snapshot-stats'
import { useSnapshotStatsCRUD } from '@/composables/snapshots/useSnapshotStatsCRUD'
import SnapshotCard from './SnapshotCard.vue'
import Select from 'primevue/select'
import Paginator from 'primevue/paginator'
import ProgressSpinner from 'primevue/progressspinner'
import SnapshotDetailDialog from './SnapshotDetailDialog.vue'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import type { SnapshotType, ISnapshot } from '@shared/contracts/interfaces/entities-stats/snapshot-stats.interfaces'

const props = defineProps<{
    serverId: string
}>()

const { t } = useI18n()
const toast = useToast()
const snapshotStore = useSnapshotStatsStore()
const { getSnapshotStatsById } = useSnapshotStatsCRUD()

const selectedType = ref<SnapshotType | 'all'>('all')
const currentPage = ref(1)
const showDetailDialog = ref(false)
const selectedSnapshot = ref<ISnapshot | null>(null)
const showDeleteConfirm = ref(false)
const snapshotToDelete = ref<string | null>(null)

const typeOptions = computed(() => [
    { label: t('views.server_settings.snapshots.list.all_types'), value: 'all' },
    { label: t('views.server_settings.snapshots.types.daily'), value: 'daily' },
    { label: t('views.server_settings.snapshots.types.weekly'), value: 'weekly' },
    { label: t('views.server_settings.snapshots.types.monthly'), value: 'monthly' },
    { label: t('views.server_settings.snapshots.types.yearly'), value: 'yearly' },
    { label: t('views.server_settings.snapshots.types.milestone'), value: 'milestone' },
    { label: t('views.server_settings.snapshots.types.custom'), value: 'custom' }
])

const fetchSnapshots = async () => {
    const params: any = {
        page: currentPage.value,
        limit: 10
    }
    if (selectedType.value !== 'all') {
        params.type = selectedType.value
    }
    await snapshotStore.fetchSnapshots(props.serverId, params)
}

// Watch for filter changes
watch([selectedType, currentPage], () => {
    fetchSnapshots()
})

// Initial load
fetchSnapshots()

const handleSnapshotClick = async (snapshotId: string) => {
    const res = await snapshotStore.fetchSnapshotById(props.serverId, snapshotId)
    if (!res.error && res.data) {
        selectedSnapshot.value = res.data
        showDetailDialog.value = true
    }
}

const handleDownload = async (snapshotId: string) => {
    try {
        const res = await getSnapshotStatsById(props.serverId, snapshotId)
        if (res.error) {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: t('views.server_settings.snapshots.download.error'),
                life: 3000
            })
            return
        }

        if (res.data) {
            // Create a blob and download the file
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `snapshot-${res.data.title ?? res.data.type}-${new Date(res.data.snapshot_date).toLocaleDateString()}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('views.server_settings.snapshots.download.success'),
                life: 3000
            })
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: t('views.server_settings.snapshots.download.error'),
            life: 3000
        })
    }
}

const handleDelete = (snapshotId: string) => {
    snapshotToDelete.value = snapshotId
    showDeleteConfirm.value = true
}

const confirmDelete = async () => {
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
        // Refresh the list
        await fetchSnapshots()
    }

    showDeleteConfirm.value = false
    snapshotToDelete.value = null
}

const onPageChange = (event: any) => {
    currentPage.value = event.page + 1
}
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
                :options="typeOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('views.server_settings.snapshots.list.filter_by_type')"
                class="w-64"
            />
        </div>

        <!-- Loading state -->
        <div v-if="snapshotStore.isLoading" class="flex justify-center items-center py-12">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <!-- Empty state -->
        <div
            v-else-if="snapshotStore.getSnapshots.length === 0"
            class="text-center py-12 bg-surface-0 rounded-2xl ring-1 ring-surface-200/60"
        >
            <p class="text-surface-500">
                {{ t('views.server_settings.snapshots.list.empty') }}
            </p>
        </div>

        <!-- Snapshot grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SnapshotCard
                v-for="snapshot in snapshotStore.getSnapshots"
                :key="snapshot.id"
                :snapshot="snapshot"
                @click="handleSnapshotClick(snapshot.id)"
                @download="handleDownload(snapshot.id)"
                @delete="handleDelete(snapshot.id)"
            />
        </div>

        <!-- Pagination -->
        <Paginator
            v-if="snapshotStore.getPagination.pageCount > 1"
            :rows="snapshotStore.getPagination.limit"
            :total-records="snapshotStore.getPagination.total"
            :first="(snapshotStore.getPagination.page - 1) * snapshotStore.getPagination.limit"
            @page="onPageChange"
        />

        <!-- Detail Dialog -->
        <SnapshotDetailDialog
            v-model:visible="showDetailDialog"
            :snapshot="selectedSnapshot"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmationDialog
            v-model="showDeleteConfirm"
            :title="t('views.server_settings.snapshots.delete.confirm_title')"
            :message="t('views.server_settings.snapshots.delete.confirm_message')"
            :on-confirm="confirmDelete"
        />
    </div>
</template>
