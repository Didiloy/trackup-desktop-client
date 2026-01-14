<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import type { Provider } from '@supabase/supabase-js'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { t } = useI18n()

const { signInWithOAuth, loading, error } = useAuth()

const acceptedTerms = ref(false)
const attemptedLogin = ref(false)

const available_providers: { provider: Provider; icon: string; label: string }[] = [
    {
        provider: 'google',
        icon: 'pi-google',
        label: 'Google'
    }
]

async function handleOAuth(provider: Provider): Promise<void> {
    if (!acceptedTerms.value) {
        attemptedLogin.value = true
        return
    }
    const redirectTo = 'trackup://auth/callback'
    const data = (await signInWithOAuth(provider, redirectTo)) as { url?: string } | undefined
    const url = data?.url
    if (url) {
        await window.api.app.openExternal(url)
    }
}

function openTerms(): void {
    window.api.app.openExternal('https://trackup.so/cgu')
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
                    class="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group border"
                    :class="[
                        acceptedTerms && !loading
                            ? 'bg-surface-0 hover:bg-surface-50 text-surface-900 border-surface-200 hover:border-surface-300 shadow-sm hover:shadow-md'
                            : 'bg-surface-50 text-surface-400 border-surface-100 cursor-not-allowed opacity-70'
                    ]"
                    :disabled="loading || !acceptedTerms"
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
                v-if="loading"
                class="mt-6 text-center text-surface-500 flex flex-col items-center gap-3 animate-pulse"
            >
                <i class="pi pi-spinner pi-spin text-xl"></i>
                <span class="text-sm font-medium">{{ t('navigation.redirecting') }}</span>
            </div>

            <div class="mt-8 pt-6 border-t border-surface-100">
                <div class="flex items-center gap-3 group cursor-pointer justify-center">
                    <div>
                        <Checkbox
                            v-model="acceptedTerms"
                            binary
                            input-id="terms"
                            :class="{ 'p-invalid': !acceptedTerms && attemptedLogin }"
                        />
                    </div>
                    <label
                        for="terms"
                        class="text-xs text-surface-500 leading-snug cursor-pointer group-hover:text-surface-700 transition-colors select-none text-left"
                    >
                        <i18n-t keypath="views.login.terms_agreement" tag="span">
                            <template #link>
                                <a
                                    href="#"
                                    class="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                                    @click.stop.prevent="openTerms"
                                    >{{ t('views.login.cgu') }}</a
                                >
                            </template>
                        </i18n-t>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
