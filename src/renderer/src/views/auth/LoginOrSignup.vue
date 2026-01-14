<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import type { Provider } from '@supabase/supabase-js'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()

const { signInWithOAuth, loading, error } = useAuth()
const user_store = useUserStore()

const available_providers: { provider: Provider; icon: string; label: string }[] = [
    {
        provider: 'google',
        icon: 'pi-google',
        label: 'Google'
    }
]

async function handleOAuth(provider: Provider): Promise<void> {
    const redirectTo = 'trackup://auth/callback'
    const data = (await signInWithOAuth(provider, redirectTo)) as { url?: string } | undefined
    const url = data?.url
    if (url) {
        await window.api.app.openExternal(url)
    }
}
</script>

<template>
    <div id="LoginOrSignup" class="w-full h-full flex items-center justify-center bg-surface-50">
        <div
            class="w-[420px] max-w-[90vw] bg-surface-0 rounded-2xl p-8 shadow-xl border border-surface-200"
        >
            <div class="flex flex-col items-center gap-6 mb-8">
                <img
                    src="@/assets/TrackUp_logo.png"
                    :alt="t('app.title')"
                    class="w-24 h-auto filter drop-shadow-sm select-none"
                    draggable="false"
                />
                <div class="text-center space-y-2">
                    <h1 class="text-2xl font-bold text-surface-900">{{ t('app.title') }}</h1>
                    <p class="text-surface-600 text-sm leading-relaxed">
                        {{ t('views.login.description') }}
                    </p>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <Button
                    v-for="{ provider, icon, label } in available_providers"
                    :key="provider"
                    class="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group border bg-surface-0 hover:bg-surface-50 text-surface-900 border-surface-200 hover:border-surface-300 shadow-sm hover:shadow-md"
                    :disabled="loading"
                    @click="handleOAuth(provider)"
                >
                    <i
                        v-if="icon"
                        :class="['pi', icon, 'text-xl transition-transform group-hover:scale-110']"
                    ></i>
                    <span class="font-medium text-base">{{ label }}</span>
                </Button>
            </div>

            <div
                v-if="error"
                class="mt-6 p-4 rounded-xl bg-red-50/50 text-red-600 text-sm flex items-start gap-3 border border-red-100"
            >
                <i class="pi pi-exclamation-circle text-lg mt-0.5"></i>
                <span class="leading-snug">{{ error }}</span>
            </div>

            <div
                v-if="loading && !user_store.hasUser "
                class="mt-6 text-center text-surface-500 flex flex-col items-center gap-3 animate-pulse"
            >
                <i class="pi pi-spinner pi-spin text-xl"></i>
                <span class="text-sm font-medium">{{ t('navigation.redirecting') }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
