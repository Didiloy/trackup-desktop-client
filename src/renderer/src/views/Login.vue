<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="w-md max-w-[90vw] bg-surface-50 rounded-xl p-6 border border-surface-200 shadow-sm">
      <div class="flex flex-col items-center gap-2 mb-6">
        <img
          src="https://raw.githubusercontent.com/Didiloy/GameClock/refs/heads/master/resources/icon.png"
          alt="TrackUp"
          class="w-12 h-12"
        />
        <h1 class="text-xl font-semibold">TrackUp</h1>
        <p class="text-sm text-gray-600">{{ t('userInterface.loginView.description') }}</p>
      </div>

      <div class="flex flex-col gap-3">
        <ProviderButton
          :disabled="loading"
          provider="google"
          :label="t('userInterface.loginView.google')"
          icon="pi-google"
          @click="handleOAuth"
        />
        <ProviderButton
          :disabled="loading"
          provider="github"
          :label="t('userInterface.loginView.github')"
          icon="pi-github"
          @click="handleOAuth"
        />
        <ProviderButton
          :disabled="loading"
          provider="gitlab"
          :label="t('userInterface.loginView.gitlab')"
          icon="pi-gitlab"
          @click="handleOAuth"
        />
      </div>

      <div v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</div>
      <div v-if="loading" class="mt-4 text-sm text-gray-600">{{ t('navigation.redirecting') }}</div>

      <div class="mt-6 text-xs text-gray-500 text-center">
        {{ t('userInterface.loginView.terms') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProviderButton from '@/components/auth/ProviderButton.vue'
import { useAuth } from '@/composables/auth/useAuth'
import type { Provider } from '@supabase/supabase-js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { signInWithOAuth, loading, error } = useAuth()

async function handleOAuth(provider: Provider) {
  // Use custom deep-link scheme to return to the app after browser auth
  const redirectTo = 'trackup://auth/callback'
  const data = await signInWithOAuth(provider, redirectTo)
  // When skipBrowserRedirect is used, Supabase returns a URL to open
  const url = (data as any)?.url
  if (url && window?.electron?.ipcRenderer) {
    // Rely on BrowserWindow setWindowOpenHandler to open externally
    window.open(url, '_blank')
  } else if (url) {
    // Last resort
    location.href = url
  }
}
</script>

<style scoped></style>
