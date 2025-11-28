// TODO: REWOrK THIS COMPONENT TO USE COMPOSITION API BETTER AND CLEANUP THE LOGIC
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import type { IUpdateInfo } from '@shared/contracts/interfaces/app.interfaces'

const { t } = useI18n()

const visible = ref(false)
const updateInfo = ref<IUpdateInfo | null>(null)
const downloading = ref(false)
const downloaded = ref(false)
const progressPercent = ref(0)
const downloadedBytes = ref(0)
const totalBytes = ref(0)
const error = ref<string | null>(null)

let unsubscribeAvailable: (() => void) | null = null
let unsubscribeDownloaded: (() => void) | null = null
let unsubscribeError: (() => void) | null = null
let unsubscribeProgress: (() => void) | null = null

onMounted(() => {
    checkForUpdates()

    unsubscribeAvailable = window.api.app.onUpdateAvailable((info) => {
        updateInfo.value = info
        visible.value = true
        error.value = null
    })

    unsubscribeDownloaded = window.api.app.onUpdateDownloaded(() => {
        downloading.value = false
        downloaded.value = true
    })

    unsubscribeError = window.api.app.onUpdateError((err) => {
        downloading.value = false
        error.value = err
    })

    unsubscribeProgress = window.api.app.onUpdateProgress((progress) => {
        progressPercent.value = Math.round(progress.percent)
        downloadedBytes.value = progress.transferred
        totalBytes.value = progress.total
    })
})

onUnmounted(() => {
    unsubscribeAvailable?.()
    unsubscribeDownloaded?.()
    unsubscribeError?.()
    unsubscribeProgress?.()
})

const checkForUpdates = async (): Promise<void> => {
    try {
        await window.api.app.checkForUpdates()
    } catch (err) {
        console.error('Failed to check for updates:', err)
    }
}

const skip = (): void => {
    visible.value = false
    updateInfo.value = null
}

const updateNow = async (): Promise<void> => {
    downloading.value = true
    error.value = null
    try {
        await window.api.app.downloadUpdate()
    } catch (err) {
        downloading.value = false
        error.value =
            err instanceof Error ? err.message : t('views.app_update_modal.download_error')
    }
}

const install = async (): Promise<void> => {
    try {
        await window.api.app.installUpdate()
    } catch (err) {
        console.error('Failed to install update:', err)
    }
}

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR')
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="!updateInfo?.isMajor"
        :close-on-escape="!updateInfo?.isMajor"
        :header="t('views.app_update_modal.title')"
        :style="{ width: '450px' }"
    >
        <div v-if="updateInfo">
            <p>
                <strong>{{ t('views.app_update_modal.version') }}:</strong>
                {{ updateInfo.version }}
            </p>
            <p>
                <strong>{{ t('common.fields.type') }}:</strong>
                {{
                    updateInfo.isMajor
                        ? t('views.app_update_modal.major')
                        : t('views.app_update_modal.minor')
                }}
            </p>
            <p v-if="updateInfo.releaseNotes">
                <strong>{{ t('views.app_update_modal.release_notes') }}:</strong>
            </p>
            <!-- eslint-disable vue/no-v-html -->
            <div class="release-notes" v-html="updateInfo.releaseNotes"></div>
            <!-- eslint-enable vue/no-v-html -->
            <p v-if="updateInfo.releaseDate">
                <strong>{{ t('views.app_update_modal.release_date') }}:</strong>
                {{ formatDate(updateInfo.releaseDate) }}
            </p>
        </div>

        <div v-if="downloading" class="mt-4">
            <p>{{ t('views.app_update_modal.downloading') }}</p>
            <ProgressBar :value="progressPercent" />
            <p class="text-sm text-gray-600">
                {{ progressPercent }}% - {{ formatBytes(downloadedBytes) }} /
                {{ formatBytes(totalBytes) }}
            </p>
        </div>

        <div v-if="error" class="mt-4 p-2 bg-red-100 text-red-800 rounded">
            <p>
                <strong>{{ t('messages.error.title') }}:</strong> {{ error }}
            </p>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    v-if="!updateInfo?.isMajor && !downloading"
                    :label="t('common.actions.skip')"
                    icon="pi pi-times"
                    class="p-button-text"
                    @click="skip"
                />
                <Button
                    v-if="!downloading && !downloaded"
                    :label="t('views.app_update_modal.update_now')"
                    icon="pi pi-check"
                    class="p-button-primary"
                    @click="updateNow"
                />
                <Button
                    v-if="downloaded"
                    :label="t('views.app_update_modal.install_and_restart')"
                    icon="pi pi-refresh"
                    class="p-button-success"
                    @click="install"
                />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.release-notes {
    max-height: 200px;
    overflow-y: auto;
    margin: 10px 0;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 4px;
}
</style>
