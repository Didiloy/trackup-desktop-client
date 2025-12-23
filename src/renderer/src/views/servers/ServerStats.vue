<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ServerHeader from '@/components/servers/profile/ServerHeader.vue'
import WidgetDashboard from '@/components/widgets/WidgetDashboard.vue'

const route = useRoute()
const serverId = computed(() => route.params.id as string)
</script>

<template>
    <WidgetDashboard :server-id="serverId" />
</template>

<style scoped></style>
