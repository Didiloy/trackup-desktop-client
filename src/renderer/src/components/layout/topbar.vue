<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

onMounted(() => {
  handleWindowControls()
})

function handleWindowControls(): void {
  const minButton = document.getElementById('min-button')
  const maxButton = document.getElementById('max-button')
  const closeButton = document.getElementById('close-button')
  const devToolsButton = document.getElementById('devtools-button')

  if (devToolsButton) {
    devToolsButton.addEventListener('click', () => {
      window.api.window.openDevTools()
    })
  }
  if (minButton) {
    minButton.addEventListener('click', () => {
      window.api.window.minimize()
    })
  }

  if (maxButton) {
    maxButton.addEventListener('click', () => {
      window.api.window.maximize()
    })
  }

  if (closeButton) {
    closeButton.addEventListener('click', async () => {
      window.api.window.close()
    })
  }
}
</script>
<template>
  <div
    id="drag-region"
    class="flex items-center justify-between w-full h-8 min-h-8 pl-2 rounded-lg bg-surface-200"
  >
    <div>
      <span class="">{{ i18n.t('app.title') }}</span>
    </div>
    <div>
      <span class="">{{ i18n.t('navigation.home') }}</span>
    </div>
    <div id="window-controls" class="flex items-center justify-center h-full w-fit bg-surface-200">
      <div
        id="devtools-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
        :title="i18n.t('actions.devtools')"
      >
        <i class="pi pi-cog"></i>
      </div>
      <div
        id="min-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
        :title="i18n.t('actions.minimize')"
      >
        <i class="pi pi-minus"></i>
      </div>
      <div
        id="max-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
        :title="i18n.t('actions.maximize')"
      >
        <i class="pi pi-sort"></i>
      </div>
      <div
        id="close-button"
        class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-red-500 hover:cursor-pointer text-gray-800 hover:text-white dark:text-gray-400"
        :title="i18n.t('actions.close')"
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
