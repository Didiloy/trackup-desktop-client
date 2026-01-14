<script setup lang="ts">
import TopAside from '@/components/asides/TopAside.vue'
import AppUpdateModal from '@/components/app-updates/AppUpdateModal.vue'
import ServerLoadingOverlay from '@/components/common/ServerLoadingOverlay.vue'
import { useAuth } from '@/composables/auth/useAuth'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { watch, onMounted } from 'vue'
import { useUserStatsStore } from '@/stores/user-stats'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppNavigation } from '@/composables/app/useAppNavigation'

const { isAuthenticated } = useAuth()
const userStatsStore = useUserStatsStore()
const userStore = useUserStore()
const { navigateToHome, navigateToLoginOrSignUp, navigateToAcceptTerms } = useAppNavigation()
const router = useRouter()

// Automatic session tracking
// We only need to START the session. The backend (Main process) handles ending it
// when the app closes or timeouts (8h).
async function initSession(): Promise<void> {
    if (isAuthenticated.value) {
        await userStatsStore.init_session_tracking()
        // Fetch stats to trigger autofetch
        await userStatsStore.fetch_all()
    }
}

// Watch for login
watch(isAuthenticated, async (newValue) => {
    if (newValue) {
        await initSession()

        // Force check terms upon authentication
        const termsAccepted = (userStore.user?.user_metadata as { terms_accepted?: boolean })
            ?.terms_accepted

        if (!termsAccepted) {
            await navigateToAcceptTerms()
        } else if (router.currentRoute.value.path === '/login') {
            // If currently on login route (e.g. after OAuth redirect), go home
            await navigateToHome()
        }
    } else {
        // Handle logout
        await navigateToLoginOrSignUp()
    }
})

// Check on mount (reload/restart)
onMounted(() => {
    initSession()
})
</script>

<template>
    <div
        id="App-wrapper"
        class="flex flex-col items-center justify-start h-screen w-screen bg-surface-200 overflow-hidden"
    >
        <TopAside />
        <AppUpdateModal />
        <router-view v-slot="{ Component }">
            <TransitionWrapper name="zoom-fade">
                <component :is="Component" />
            </TransitionWrapper>
        </router-view>
        <Toast />

        <!-- Server Loading Overlay -->
        <ServerLoadingOverlay />
    </div>
</template>
