<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ActivityCreateDialog from '@/components/activities/create/ActivityCreateDialog.vue'
import ActivityFilterBar from '@/components/activities/ActivityFilterBar.vue'
import { ref } from 'vue'
import type { IActivity } from '../../../../shared/contracts/interfaces/entities/activity.interfaces'
const i18n = useI18n()

const showAddActivityDialog = ref(false)
function onActivityCreated(activity: IActivity): void {
    console.log('onActivityCreated', activity)
}
function onAddActivity(): void {
    showAddActivityDialog.value = true
}

//TODO créer les skills levels a la création des activités.

const filterQuery = ref('')
const filterSort = ref<'recent' | 'popular' | 'active'>('recent')
const filterOnlyMine = ref(false)
function onFiltersChange(): void {
    // TODO: call list API with filters
}
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('userInterface.serverActivitiesView.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="i18n.t('userInterface.serverActivitiesView.addActivity')"
                    @click="onAddActivity"
                    severity="primary"
                    class=""
                    size="small"
                    :pt="{
                        label: { class: 'text-surface-100' },
                        icon: { class: 'text-surface-100' }
                    }"
                />
            </div>
        </div>
        <div class="w-full px-2 pb-2">
            <ActivityFilterBar
                :query="filterQuery"
                :sort="filterSort"
                :onlyMine="filterOnlyMine"
                @update:query="(v) => (filterQuery = v)"
                @update:sort="(v) => (filterSort = v)"
                @update:onlyMine="(v) => (filterOnlyMine = v)"
                @change="onFiltersChange"
            />
        </div>
        <div class="flex flex-col items-center justify-start w-full h-full"></div>
        <ActivityCreateDialog v-model="showAddActivityDialog" @created="onActivityCreated" />
    </div>
</template>
