<script setup lang="ts">
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'
import ActivityCreateDialog from '@/components/activities/create/ActivityCreateDialog.vue'
import { ref } from 'vue'
import type { IActivity } from '../../../../shared/contracts/interfaces/entities/activity.interfaces'
const server_store = useServerStore()
const i18n = useI18n()

const showAddActivityDialog = ref(false)
function onActivityCreated(activity: IActivity): void {
    console.log('onActivityCreated', activity)
}
function onAddActivity(): void {
    showAddActivityDialog.value = true
}
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-15 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('userInterface.serverActivitiesView.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="i18n.t('userInterface.serverActivitiesView.addActivity')"
                    @click="onAddActivity"
                    severity="primary"
                    class="mr-2"
                />
            </div>
        </div>
        <ActivityCreateDialog v-model="showAddActivityDialog" @created="onActivityCreated" />
    </div>
</template>

<style scoped></style>
