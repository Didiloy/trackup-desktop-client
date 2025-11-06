<script setup lang="ts">
import TopAside from '@/components/asides/TopAside.vue'
import UpdateModal from '@/components/UpdateModal.vue'
import { useAuth } from '@/composables/auth/useAuth'
import { onMounted } from 'vue'
import LoginOrSignup from '@/views/LoginOrSignup.vue'
import Application from '@/views/Application.vue'

const { isAuthenticated } = useAuth()

onMounted(async () => {
  console.log(isAuthenticated.value)
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-start h-screen w-screen bg-surface-200 overflow-hidden"
  >
    <TopAside />
    <UpdateModal />
    <LoginOrSignup v-if="!isAuthenticated" key="login" />
    <Application v-else key="application" />
    <Toast />
  </div>
</template>
