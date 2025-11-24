<script setup lang="ts">
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{
    sessions: IActivitySessionListItem[]
    loading?: boolean
    total?: number
    page?: number
    rows?: number
}>()

const emit = defineEmits<{
    (e: 'page', payload: { page: number; rows: number }): void
}>()

function onPage(event: any): void {
    emit('page', { page: event.page + 1, rows: event.rows })
}
</script>

<template>
    <DataTable
        :value="sessions"
        :paginator="true"
        :rows="rows"
        :totalRecords="total"
        :first="((page ?? 1) - 1) * (rows ?? 10)"
        :loading="loading"
        class="rounded-2xl overflow-hidden bg-surface-100 ring-1 ring-surface-200 p-5"
        @page="onPage"
        :pt="{
            root: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            header: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            tableContainer: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            headerRow: { class: 'bg-surface-50', style: { backgroundColor: 'var(--p-surface-50)' } },
            headerCell: { class: 'bg-surface-50', style: { backgroundColor: 'var(--p-surface-50)' } },
            bodyRow: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            bodyCell: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            footerRow: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            footerCell: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            pagination: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
            paginationItem: { class: 'bg-surface-100', style: { backgroundColor: 'var(--p-surface-100)' } },
        }"
    >
    <!-- TODO voir pourquoi le pt ne fonctionne pas pour le background color -->
        <Column field="date" header="Date">
            <template #body="slotProps">
                {{ new Date(slotProps.data.date).toLocaleString() }}
            </template>
        </Column>
        <Column field="duration" header="Duration (min)">
            <template #body="slotProps">
                {{ slotProps.data.duration }}
            </template>
        </Column>
        <Column field="participants_count" header="Participants" />
        <Column field="likes_count" header="Likes" />
    </DataTable>
</template>
