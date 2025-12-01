<script setup lang="ts">
import Server from '../Server.vue'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'


interface Emits {
    (e: 'server-click', id: string): void
    (e: 'server-action-click'): void
}

const emit = defineEmits<Emits>()
const server_store = useServerStore()
const user_store = useUserStore()
const { t } = useI18n()
</script>

<template>
    <div class="flex-1 w-full scroll-y-hide mb-8">
        <div class="flex flex-col items-center gap-2 pb-2">
            <Server
                v-for="server in user_store.getMyServers" :key="server.public_id"
                :image-url="
                    server_store.getPublicId === server.public_id
                        ? (server_store.getLogo ?? server.logo)
                        : server.logo
                "
                :label="
                    server_store.getPublicId === server.public_id
                        ? (server_store.getName ?? server.name)
                        : server.name
                "
                :active="server_store.getPublicId === server.public_id"
                @click="emit('server-click', server.public_id)"
            />
            <AvatarButton
                icon="pi pi-plus"
                size="normal"
                shape="rounded"
                :title="t('views.create_server.action.title')"
                button-class="rounded-2xl bg-surface-300 hover:bg-primary-300 click:bg-primary-400 hover:scale-110"
                @click="emit('server-action-click')"
            />
        </div>
    </div>
</template>

<style scoped>
.scroll-y-hide {
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
}
.scroll-y-hide::-webkit-scrollbar {
    width: 0;
    height: 0;
}
</style>
