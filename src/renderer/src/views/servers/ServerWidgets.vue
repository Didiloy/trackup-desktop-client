<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <div class="p-4">{{ t('server.widgets') }}</div>
</template>

<style scoped></style>
