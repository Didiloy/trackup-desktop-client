<script setup lang="ts">
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

interface Props {
    activities: IActivity[]
    loading?: boolean
    totalRecords: number
    page: number
    rows: number
}

interface Emits {
    (e: 'page', event: any): void
    (e: 'view', activityId: string): void
    (e: 'edit', activityId: string): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})
const emit = defineEmits<Emits>()

function onVirtualScrollerLazyLoad(event: { first: number; last: number }): void {
    const page = Math.floor(event.first / props.rows)
    emit('page', { page, rows: props.rows })
}
</script>

<template>
    <DataTable
        :value="activities"
        :lazy="true"
        :paginator="false"
        :rows="rows"
        :totalRecords="totalRecords"
        :loading="loading"
        scrollable
        scrollHeight="flex"
        :virtualScrollerOptions="{
            lazy: true,
            onLazyLoad: onVirtualScrollerLazyLoad,
            itemSize: 80
        }"
        :pt="{
            root: { class: 'rounded-lg shadow-sm border border-surface-200' },
            header: { class: 'bg-surface-50' },
            wrapper: { class: 'rounded-lg' }
        }"
    >
        <template #empty>
            <div class="flex flex-col items-center justify-center py-12 text-surface-500">
                <i class="pi pi-inbox text-6xl mb-4"></i>
                <p class="text-lg font-medium">No activities found</p>
                <p class="text-sm">Create your first activity to get started!</p>
            </div>
        </template>

        <template #loading>
            <div class="flex items-center justify-center py-8">
                <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
            </div>
        </template>

        <Column field="logo" header="Logo" style="width: 80px">
            <template #body="slotProps">
                <div
                    class="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-surface-100"
                >
                    <img
                        v-if="slotProps.data.logo"
                        :src="slotProps.data.logo"
                        :alt="slotProps.data.name"
                        class="w-full h-full object-cover"
                    />
                    <span v-else class="text-xl font-bold text-surface-500">
                        {{ slotProps.data.name.charAt(0).toUpperCase() }}
                    </span>
                </div>
            </template>
        </Column>

        <Column field="name" header="Name" style="min-width: 200px">
            <template #body="slotProps">
                <div class="font-semibold text-surface-900">
                    {{ slotProps.data.name }}
                </div>
            </template>
        </Column>

        <Column field="description" header="Description" style="min-width: 300px">
            <template #body="slotProps">
                <div class="text-surface-600 text-sm line-clamp-2">
                    {{ slotProps.data.description || 'No description' }}
                </div>
            </template>
        </Column>

        <Column header="Actions" style="width: 120px">
            <template #body="slotProps">
                <div class="flex gap-2">
                    <Button
                        icon="pi pi-eye"
                        severity="secondary"
                        text
                        rounded
                        @click="emit('view', slotProps.data.public_id)"
                        v-tooltip.top="'View'"
                    />
                    <Button
                        icon="pi pi-pencil"
                        severity="secondary"
                        text
                        rounded
                        @click="emit('edit', slotProps.data.public_id)"
                        v-tooltip.top="'Edit'"
                    />
                </div>
            </template>
        </Column>
    </DataTable>
</template>
