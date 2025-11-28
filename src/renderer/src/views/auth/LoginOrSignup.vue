<template>
    <div id="LoginOrSignup" class="w-full h-full flex items-center justify-center">
        <div
            class="w-md max-w-[90vw] bg-surface-50 rounded-xl p-6 border border-surface-200 shadow-sm"
        >
            <div class="flex flex-col items-center gap-2 mb-6">
                <img
                    src="https://raw.githubusercontent.com/Didiloy/GameClock/refs/heads/master/resources/icon.png"
                    :alt="t('app.title')"
                    class="w-12 h-12"
                />
                <h1 class="text-xl font-semibold">{{ t('app.title') }}</h1>
                <p class="text-sm text-gray-600">{{ t('views.login.description') }}</p>
            </div>

            <div class="flex flex-col gap-3">
                <button
                    v-for="{ provider, icon, label } in available_providers"
                    :key="provider"
                    class="w-full h-11 px-3 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-900 flex items-center justify-center gap-2 border border-surface-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    :disabled="loading"
                    @click="handleOAuth(provider)"
                >
                    <i v-if="icon" :class="['pi', icon]"></i>
                    <span class="font-medium">{{ label }}</span>
                </button>
            </div>

            <div v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</div>
            <div v-if="loading" class="mt-4 text-sm text-gray-600">
                {{ t('navigation.redirecting') }}
            </div>

            <div class="mt-6 text-xs text-gray-500 text-center">
                {{ t('views.login.terms') }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import type { Provider } from '@supabase/supabase-js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { signInWithOAuth, loading, error } = useAuth()

const available_providers: { provider: Provider; icon: string; label: string }[] = [
    {
        provider: 'google',
        icon: 'pi-google',
        label: t('views.login.continue_with_google')
    },
    {
        provider: 'github',
        icon: 'pi-github',
        label: t('views.login.continue_with_github')
    },
    {
        provider: 'gitlab',
        icon: 'pi-gitlab',
        label: t('views.login.continue_with_gitlab')
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

<style scoped></style>
