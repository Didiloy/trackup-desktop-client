<script setup lang="ts">
import type {
    IActivitySessionListItem
} from '@shared/contracts/interfaces/entities/activity.interfaces'

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
        class="rounded-2xl overflow-hidden shadow-sm"
        @page="onPage"
    >
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


