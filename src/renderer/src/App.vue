<script setup lang="ts">
import TopAside from '@/components/asides/TopAside.vue'
import AppUpdateModal from '@/components/app-updates/AppUpdateModal.vue'
import ServerLoadingOverlay from '@/components/common/ServerLoadingOverlay.vue'
import { useAuth } from '@/composables/auth/useAuth'
import LoginOrSignup from '@/views/auth/LoginOrSignup.vue'
import Application from '@/views/app/Application.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const { isAuthenticated } = useAuth()
</script>

<template>
    <div
        id="App-wrapper"
        class="flex flex-col items-center justify-start h-screen w-screen bg-surface-200 overflow-hidden"
    >
        <TopAside />
        <AppUpdateModal />
        <TransitionWrapper name="zoom-fade">
            <LoginOrSignup v-if="!isAuthenticated" key="login" />
            <Application v-else key="application" />
        </TransitionWrapper>
        <Toast />

        <!-- Server Loading Overlay -->
        <ServerLoadingOverlay />
    </div>
</template>
