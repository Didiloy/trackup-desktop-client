<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import SnapshotManagement from '@/components/server-settings/snapshots/SnapshotManagement.vue'
import Divider from 'primevue/divider'

const { t } = useI18n()
const server_store = useServerStore()
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <div class="flex flex-col gap-6 mb-6">
            <div>
                <h1 class="text-2xl font-bold text-surface-900">
                    {{ t('views.server_settings.title') }}
                </h1>
                <p class="text-surface-500 mt-1">
                    {{ t('views.server_settings.subtitle') }}
                </p>
            </div>
        </div>

        <!-- Snapshots Section (Owner only) -->
        <div v-if="server_store.getPublicId" class="mb-8">
            <SnapshotManagement :server-id="server_store.getPublicId" />
            <Divider class="my-8" />
        </div>
    </div>
</template>

<style scoped></style>
