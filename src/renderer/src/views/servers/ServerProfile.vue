<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import TransitionWrapper from '@/components/common/TransitionWrapper.vue'
import { useServerStore } from '@/stores/server'

const route = useRoute()
const server_id = ref<string>(route.params.id as string)
const server_store = useServerStore()

</script>

<template>
  <div>
    <TransitionWrapper name="slide-fade">
      <div v-if="server_store.hasServer" :key="server_id">
        <h1>Server {{ server_store.getPublicId }}</h1>
        <p>
          {{ server_store.getName }}
          {{ server_store.getInvitationCode }}
          {{ server_store.getMembers?.length }} members
          {{ server_store.getDescription }}
          {{ server_store.getInvitationCodeExpDate }}
          {{ server_store.getServerTypePublicId }}
        </p>
      </div>
    </TransitionWrapper>
  </div>
</template>
