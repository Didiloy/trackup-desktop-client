<script setup lang="ts">
import Server from '../Server.vue'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import type { IUserServer } from '@shared/contracts/interfaces/entities/user.interfaces'

interface Props {
    servers: IUserServer[]
    activeServerId?: string
    createServerLabel: string
}

interface Emits {
    (e: 'server-click', id: string): void
    (e: 'server-action-click'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
    <div class="flex-1 w-full scroll-y-hide mb-8">
        <div class="flex flex-col items-center gap-2 pb-2">
            <template v-for="server in servers" :key="server.public_id">
                <Server
                    :image-url="server.logo"
                    :label="server.name"
                    :active="activeServerId === server.public_id"
                    @click="emit('server-click', server.public_id)"
                />
            </template>
            <AvatarButton
                icon="pi pi-plus"
                size="normal"
                shape="rounded"
                :title="createServerLabel"
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
