<script setup lang="ts">
import { useServerStore } from '@/stores/server'

const server_store = useServerStore()
</script>

<template>
    <div class="p-4">
        <div v-if="server_store.isLoading" class="flex flex-col gap-4">
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="80%" height="1.5rem" />
            <Skeleton width="60%" height="1.5rem" />
        </div>
        <div v-else>
            <h2 class="text-2xl font-bold mb-4">{{ server_store.getName }}</h2>
            <p class="text-surface-600">{{ server_store.getDescription }}</p>
        </div>
    </div>
</template>

<style scoped></style>
