<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
    <ul class="versions">
        <li class="electron-version">versions electron {{ versions.electron }}</li>
        <li class="chrome-version">versions chromium {{ versions.chrome }}</li>
        <li class="node-version">versions node {{ versions.node }}</li>
    </ul>
</template>
