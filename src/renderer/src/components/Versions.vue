<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
    <ul class="versions">
        <li class="electron-version">{{ t('versions.electron', { version: versions.electron }) }}</li>
        <li class="chrome-version">{{ t('versions.chromium', { version: versions.chrome }) }}</li>
        <li class="node-version">{{ t('versions.node', { version: versions.node }) }}</li>
    </ul>
</template>
