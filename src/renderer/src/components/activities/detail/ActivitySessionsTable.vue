<script setup lang="ts">
import type { IActivitySessionListItem } from '@shared/contracts/interfaces/entities/activity.interfaces'
import { useI18n } from 'vue-i18n'

defineProps<{
    sessions: IActivitySessionListItem[]
    loading?: boolean
    total?: number
    page?: number
    rows?: number
}>()

const emit = defineEmits<{
    (e: 'page', payload: { page: number; rows: number }): void
}>()

const { t } = useI18n()

function onPage(event: { page: number; rows: number }): void {
    emit('page', { page: event.page + 1, rows: event.rows })
}
</script>

<template>
    <DataTable
        :value="sessions"
        :paginator="true"
        :rows="rows"
        :total-records="total"
        :first="((page ?? 1) - 1) * (rows ?? 10)"
        :loading="loading"
        class="rounded-2xl overflow-hidden bg-surface-100 ring-1 ring-surface-200 p-5"
        @page="onPage"
    >
        <Column field="title" :header="t('common.fields.title')">
            <template #body="slotProps">
                {{ slotProps.data.title || t('common.fields.no_title') }}
            </template>
        </Column>
        <Column field="date" :header="t('common.session_details.date')">
            <template #body="slotProps">
                {{ new Date(slotProps.data.date).toLocaleString() }}
            </template>
        </Column>
        <Column
            field="duration"
            :header="
                t('common.session_details.duration') + ' (' + t('common.misc.minutes_short') + ')'
            "
        >
            <template #body="slotProps">
                {{ slotProps.data.duration }}
            </template>
        </Column>
        <Column field="participants_count" :header="t('common.session_details.participants')" />
        <Column field="likes_count" :header="t('views.activity.card.likes')" />
    </DataTable>
</template>
