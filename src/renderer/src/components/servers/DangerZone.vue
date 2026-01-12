<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useServerList } from '@/composables/servers/useServerList'
import ConfirmationDialog from '@/components/common/dialogs/ConfirmationDialog.vue'
import Button from 'primevue/button'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const server_store = useServerStore()
const { quitServer } = useMemberCRUD()
const { deleteServer } = useServerCRUD()
const { fetchServers } = useServerList()

const showLeaveConfirm = ref(false)
const showArchiveConfirm = ref(false)

/**
 * Handle leave server action (for non-owners)
 */
const handleLeaveServer = async (): Promise<void> => {
    if (!server_store.getPublicId) return

    const result = await quitServer(server_store.getPublicId)
    if (result.data !== undefined) {
        server_store.resetState()
        server_store.clearCache()
        await fetchServers()
        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('views.server_settings.danger_zone.leave_server.title'),
            life: 3000
        })
        router.push({ name: 'Home' })
    } else {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: result.error || t('messages.error.delete'),
            life: 5000
        })
        throw new Error(result.error || 'Failed to leave server')
    }
}

/**
 * Handle archive server action (for owners)
 */
const handleArchiveServer = async (): Promise<void> => {
    if (!server_store.getPublicId) return

    const result = await deleteServer(server_store.getPublicId)
    if (result.data !== undefined) {
        server_store.resetState()
        server_store.clearCache()
        await fetchServers()
        toast.add({
            severity: 'success',
            summary: t('messages.success.title'),
            detail: t('views.server_settings.danger_zone.archive_server.title'),
            life: 3000
        })
        router.push({ name: 'Home' })
    } else {
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: result.error || t('messages.error.delete'),
            life: 5000
        })
        throw new Error(result.error || 'Failed to archive server')
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Section Header -->
        <div class="flex flex-col gap-1">
            <h2 class="text-xl font-bold text-red-600 flex items-center gap-2">
                <i class="pi pi-exclamation-triangle" />
                {{ t('views.server_settings.danger_zone.title') }}
            </h2>
            <p class="text-surface-500 text-sm">
                {{ t('views.server_settings.danger_zone.description') }}
            </p>
        </div>

        <!-- Danger Zone Content -->
        <div class="border border-red-200 rounded-lg bg-red-50 p-4">
            <!-- Leave Server (for non-owner members) -->
            <div v-if="!server_store.isOwnership" class="flex items-center justify-between">
                <div class="flex flex-col gap-1">
                    <span class="font-semibold text-surface-900">
                        {{ t('views.server_settings.danger_zone.leave_server.title') }}
                    </span>
                    <span class="text-sm text-surface-600">
                        {{ t('views.server_settings.danger_zone.leave_server.description') }}
                    </span>
                </div>
                <Button
                    :label="t('views.server_settings.danger_zone.leave_server.button')"
                    severity="danger"
                    outlined
                    icon="pi pi-sign-out"
                    @click="showLeaveConfirm = true"
                />
            </div>

            <!-- Archive Server (for owner) -->
            <div v-else class="flex items-center justify-between">
                <div class="flex flex-col gap-1">
                    <span class="font-semibold text-surface-900">
                        {{ t('views.server_settings.danger_zone.archive_server.title') }}
                    </span>
                    <span class="text-sm text-surface-600">
                        {{ t('views.server_settings.danger_zone.archive_server.description') }}
                    </span>
                </div>
                <Button
                    :label="t('views.server_settings.danger_zone.archive_server.button')"
                    severity="danger"
                    icon="pi pi-folder"
                    @click="showArchiveConfirm = true"
                />
            </div>
        </div>

        <!-- Leave Server Confirmation Dialog -->
        <ConfirmationDialog
            v-model="showLeaveConfirm"
            :title="t('views.server_settings.danger_zone.leave_server.title')"
            :message="t('views.server_settings.danger_zone.leave_server.confirm_message')"
            :confirm-label="t('views.server_settings.danger_zone.leave_server.button')"
            :on-confirm="handleLeaveServer"
        />

        <!-- Archive Server Confirmation Dialog -->
        <ConfirmationDialog
            v-model="showArchiveConfirm"
            :title="t('views.server_settings.danger_zone.archive_server.title')"
            :message="t('views.server_settings.danger_zone.archive_server.confirm_message')"
            :confirm-label="t('views.server_settings.danger_zone.archive_server.button')"
            :on-confirm="handleArchiveServer"
        />
    </div>
</template>

<style scoped></style>
