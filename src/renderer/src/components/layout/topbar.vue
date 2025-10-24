<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

onMounted(() => {
  handleWindowControls()
})

function handleWindowControls(): void {
  document.getElementById('min-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('minimize')
  })

  document.getElementById('max-button').addEventListener('click', () => {
    window.electron.ipcRenderer.send('maximize')
  })

  document.getElementById('close-button').addEventListener('click', async () => {
    window.electron.ipcRenderer.send('close')
  })
}
</script>
<template>
  <div id="drag-region" class="flex items-center justify-between w-full h-8 bg-surface-200">
    <div>
      <span class="">TrackUp</span>
    </div>
    <div>
      <span class="">Contenu</span>
    </div>
    <div id="window-controls" class="flex items-center justify-center h-full w-fit">
      <div
        id="min-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-300 hover:cursor-pointer text-gray-600 hover:text-black"
        :title="i18n.t('topbar.minimize')"
      >
        <i class="pi pi-minus"></i>
      </div>
      <div
        id="max-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-300 hover:cursor-pointer text-gray-600 hover:text-black"
        :title="i18n.t('topbar.maximize')"
      >
        <i class="pi pi-sort"></i>
      </div>
      <div
        id="close-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-red-500 hover:cursor-pointer text-gray-800 hover:text-white"
        :title="i18n.t('topbar.close')"
      >
        <i class="pi pi-times"></i>
      </div>
    </div>
  </div>
</template>
<style scoped>
#drag-region {
  -webkit-app-region: drag;
}

#window-controls {
  -webkit-app-region: no-drag;
}
</style>
