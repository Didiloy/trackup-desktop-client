<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="!updateInfo?.isMajor"
        :close-on-escape="!updateInfo?.isMajor"
        :header="t('userInterface.updateModal.title')"
        :style="{ width: '450px' }"
    >
        <div v-if="updateInfo">
            <p>
                <strong>{{ t('userInterface.updateModal.version') }}:</strong>
                {{ updateInfo.version }}
            </p>
            <p>
                <strong>{{ t('userInterface.updateModal.type') }}:</strong>
                {{
                    updateInfo.isMajor
                        ? t('userInterface.updateModal.major')
                        : t('userInterface.updateModal.minor')
                }}
            </p>
            <p v-if="updateInfo.releaseNotes">
                <strong>{{ t('userInterface.updateModal.releaseNotes') }}:</strong>
            </p>
            <div class="release-notes" v-html="updateInfo.releaseNotes"></div>
            <p v-if="updateInfo.releaseDate">
                <strong>{{ t('userInterface.updateModal.releaseDate') }}:</strong>
                {{ formatDate(updateInfo.releaseDate) }}
            </p>
        </div>

        <div v-if="downloading" class="mt-4">
            <p>{{ t('userInterface.updateModal.downloading') }}</p>
            <ProgressBar :value="progressPercent" />
            <p class="text-sm text-gray-600">
                {{ progressPercent }}% - {{ formatBytes(downloadedBytes) }} /
                {{ formatBytes(totalBytes) }}
            </p>
        </div>

        <div v-if="error" class="mt-4 p-2 bg-red-100 text-red-800 rounded">
            <p>
                <strong>{{ t('userInterface.updateModal.error') }}:</strong> {{ error }}
            </p>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    v-if="!updateInfo?.isMajor && !downloading"
                    :label="t('userInterface.updateModal.skip')"
                    icon="pi pi-times"
                    class="p-button-text"
                    @click="skip"
                />
                <Button
                    v-if="!downloading && !downloaded"
                    :label="t('userInterface.updateModal.updateNow')"
                    icon="pi pi-check"
                    class="p-button-primary"
                    @click="updateNow"
                />
                <Button
                    v-if="downloaded"
                    :label="t('userInterface.updateModal.installAndRestart')"
                    icon="pi pi-refresh"
                    class="p-button-success"
                    @click="install"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import type { IUpdateInfo } from 'src/shared/contracts/interfaces/app.interfaces'

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

const checkForUpdates = async () => {
    try {
        await window.api.app.checkForUpdates()
    } catch (err) {
        console.error('Failed to check for updates:', err)
    }
}

const skip = () => {
    visible.value = false
    updateInfo.value = null
}

const updateNow = async () => {
    downloading.value = true
    error.value = null
    try {
        await window.api.app.downloadUpdate()
    } catch (err) {
        downloading.value = false
        error.value = err instanceof Error ? err.message : t('updateModal.downloadError')
    }
}

const install = async () => {
    try {
        await window.api.app.installUpdate()
    } catch (err) {
        console.error('Failed to install update:', err)
    }
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

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
