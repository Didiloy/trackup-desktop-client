<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { maskKey, copyKeyToClipBoard, formatDate } from '@/utils'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { refreshInviteCode } = useServerCRUD()

const isRefreshing = ref(false)
const showToken = ref(false)
const showServerId = ref(false)

const maskedCode = computed(() => {
    if (!server_store.getInvitationCode) return '••••••••••'
    if (showToken.value) return server_store.getInvitationCode
    return maskKey(server_store.getInvitationCode)
})

const maskedServerId = computed(() => {
    if (!server_store.getPublicId) return '••••••••••'
    if (showServerId.value) return server_store.getPublicId
    return maskKey(server_store.getPublicId)
})

const formattedExpiry = computed(() => {
    if (!server_store.getInvitationCodeExpDate) return null
    return formatDate(server_store.getInvitationCodeExpDate)
})

/**
 * Copy invitation code to clipboard
 */
const handleCopy = (): void => {
    if (!server_store.getInvitationCode) return
    copyKeyToClipBoard(server_store.getInvitationCode, toast, { t } as any)
}

/**
 * Copy server ID to clipboard
 */
const handleCopyServerId = (): void => {
    if (!server_store.getPublicId) return
    copyKeyToClipBoard(server_store.getPublicId, toast, { t } as any)
}

/**
 * Refresh the invitation code
 */
const handleRefresh = async (): Promise<void> => {
    if (!server_store.getPublicId) return

    isRefreshing.value = true
    try {
        const result = await refreshInviteCode(server_store.getPublicId)
        if (result.data) {
            await server_store.setServer(result.data)
            toast.add({
                severity: 'success',
                summary: t('messages.success.title'),
                detail: t('views.server_settings.confidential.refresh_success'),
                life: 3000
            })
        } else {
            toast.add({
                severity: 'error',
                summary: t('messages.error.title'),
                detail: result.error || t('messages.error.update'),
                life: 5000
            })
        }
    } catch (error) {
        console.error('Failed to refresh invite code:', error)
        toast.add({
            severity: 'error',
            summary: t('messages.error.title'),
            detail: error instanceof Error ? error.message : 'Unknown error',
            life: 5000
        })
    } finally {
        isRefreshing.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Section Header -->
        <div class="flex flex-col gap-1">
            <h2 class="text-xl font-bold text-surface-900 flex items-center gap-2">
                <i class="pi pi-shield" />
                {{ t('views.server_settings.confidential.title') }}
            </h2>
            <p class="text-surface-500 text-sm">
                {{ t('views.server_settings.confidential.description') }}
            </p>
        </div>

        <!-- Server ID Section -->
        <div class="border border-surface-200 rounded-lg bg-surface-0 p-4">
            <div class="flex flex-col gap-2">
                <label class="font-medium text-surface-700 text-sm">
                    {{ t('views.server_settings.confidential.server_id_label') }}
                </label>
                <div class="flex items-center gap-2">
                    <div class="flex-1 relative">
                        <InputText
                            :model-value="maskedServerId"
                            class="w-full font-mono"
                            readonly
                        />
                    </div>
                    <Button
                        :icon="showServerId ? 'pi pi-eye-slash' : 'pi pi-eye'"
                        severity="secondary"
                        outlined
                        @click="showServerId = !showServerId"
                    />
                    <Button
                        icon="pi pi-copy"
                        severity="secondary"
                        outlined
                        :disabled="!server_store.getPublicId"
                        @click="handleCopyServerId"
                    />
                </div>
            </div>
        </div>

        <!-- Invitation Code Section -->
        <div class="border border-surface-200 rounded-lg bg-surface-0 p-4">
            <div class="flex flex-col gap-4">
                <!-- Token Display -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-surface-700 text-sm">
                        {{ t('views.server_settings.confidential.invitation_code_label') }}
                    </label>
                    <div class="flex items-center gap-2">
                        <div class="flex-1 relative">
                            <InputText
                                :model-value="maskedCode"
                                class="w-full font-mono"
                                readonly
                            />
                        </div>
                        <Button
                            :icon="showToken ? 'pi pi-eye-slash' : 'pi pi-eye'"
                            severity="secondary"
                            outlined
                            @click="showToken = !showToken"
                        />
                        <Button
                            icon="pi pi-copy"
                            severity="secondary"
                            outlined
                            :disabled="!server_store.getInvitationCode"
                            @click="handleCopy"
                        />
                    </div>
                </div>

                <!-- Expiration Date -->
                <div v-if="formattedExpiry" class="flex items-center gap-2 text-sm text-surface-500">
                    <i class="pi pi-calendar" />
                    <span>{{ t('views.server_settings.confidential.expires_at') }}: {{ formattedExpiry }}</span>
                </div>

                <!-- Refresh Button -->
                <div class="flex justify-end">
                    <Button
                        :label="t('views.server_settings.confidential.refresh_button')"
                        icon="pi pi-refresh"
                        severity="secondary"
                        :loading="isRefreshing"
                        @click="handleRefresh"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
