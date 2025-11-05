<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ServerItem from './server-item.vue'
import { user, session } from '@/composables/auth/utils/authState'
import type { IUserServer } from '../../../../shared/contracts/interfaces/entities/user.interfaces'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import ProfileButton from './profile-button.vue'
import AppDialog from '@/components/common/AppDialog.vue'
import CreateServerForm from '@/components/server/CreateServerForm.vue'

import { useI18n } from 'vue-i18n'
import { IServer } from '../../../../shared/contracts/interfaces/entities/server.interfaces'
import { useUser } from '@/composables/entities'

const i18n = useI18n()

const servers = ref<IUserServer[]>([])
const user_store = useUserStore()
const route = useRoute()
const router = useRouter()
const { getMyServers } = useUser()

async function fetchServers(): Promise<void> {
  try {
    const res = await getMyServers()
    servers.value = res.data ?? []
  } catch {
    servers.value = []
  }
}

onMounted(async () => {
  await fetchServers()
})

function openServer(id: string): void {
  if (route.params.id !== id) {
    router.push(`/servers/${id}`)
  }
}

const showCreate = ref(false)

function openCreate(): void {
  showCreate.value = true
}

async function onCreated(server: IServer): Promise<void> {
  showCreate.value = false
  await fetchServers()
  if (server?.public_id) await router.push(`/servers/${server.public_id}`)
}
</script>
<template>
  <div class="flex flex-col items-center w-16 h-full my-2 bg-surface-200 rounded-lg">
    <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
      <ProfileButton :image-url="user_store.getAvatar" :label="user_store.getEmail || 'Me'" />
      <div class="w-8 h-px bg-surface-400 my-1"></div>
    </div>

    <div class="flex-1 w-full overflow-y-auto">
      <div class="flex flex-col items-center gap-2 pb-2">
        <template v-for="s in servers" :key="s.public_id">
          <ServerItem
            :image-url="s.logo"
            :label="s.name"
            :active="route.params.id === s.public_id"
            @click="openServer(s.public_id)"
          />
        </template>
        <ServerItem
          icon="pi pi-plus"
          :label="i18n.t('userInterface.createServerView.title')"
          @click="openCreate()"
        />
      </div>
    </div>

    <AppDialog
      v-model="showCreate"
      :style-class="'w-[560px] max-w-[92vw] rounded-xl'"
      :content-class="'p-0 bg-surface-50'"
    >
      <template #header>
        <div class="flex items-center gap-2 p-3 select-none">
          <i class="pi pi-plus-circle text-primary-500"></i>
          <span class="font-semibold text-surface-900">{{
            i18n.t('userInterface.createServerView.title')
          }}</span>
        </div>
      </template>
      <div class="p-4">
        <CreateServerForm @created="onCreated" @cancel="showCreate = false" />
      </div>
    </AppDialog>
  </div>
</template>
