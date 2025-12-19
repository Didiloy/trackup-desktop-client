<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseServerStatWidget from './BaseServerStatWidget.vue'

defineProps<{
    activeMembers: number | undefined
    totalMembers: number | undefined
    loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <BaseServerStatWidget
        :label="t('views.server_stats.active_members', 'Active Members')"
        :value="activeMembers?.toLocaleString() ?? 0"
        :subValue="`/ ${totalMembers ?? 0} ${t('common.fields.total', 'Total')}`"
        icon="pi pi-users"
        color="text-green-500"
        bg="bg-green-500/10"
        :loading="loading"
    />
</template>
