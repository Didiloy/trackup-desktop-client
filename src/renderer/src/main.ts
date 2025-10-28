import './style/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from '@/App.vue'
import { TrackupPreset } from '@/style/preset'
import { createPinia } from 'pinia'
import { router } from '@/router/router'

import { i18n, loadLanguageAsync } from '@/i18n'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: TrackupPreset,
    options: {
      prefix: 'p',
      darkModeSelector: 'system'
    }
  }
})

app.use(router)

const pinia = createPinia()
app.use(pinia)

app.use(i18n)

// Function to initialize app with the correct language
async function initializeApp(): Promise<void> {
  // Initialize pinia
  // const preferenceStore = usePreferenceStore()
  // const { readPref } = usePreferenceCRUD()

  try {
    // Try to load user preferences first
    // const response = await readPref()

    // If we have preferences with a language setting, use it
    let locale = i18n.global.locale // Default

    // if (response && response.preference && response.preference.language) {
    //   // preferenceStore.setPreference(response.preference)
    //   locale = response.preference.language
    // }

    // Load the language
    const messages = await loadLanguageAsync(locale)
    if (messages) {
      i18n.global.setLocaleMessage(locale, messages)
      i18n.global.locale = locale
    }

    // Mount the app after language is loaded
    app.mount('#app')
  } catch (error) {
    // If we can't load preferences, fall back to default behavior
    const locale = i18n.global.locale
    const messages = await loadLanguageAsync(locale)
    if (messages) {
      i18n.global.setLocaleMessage(locale, messages)
    }

    console.error('Failed to load user preferences:', error)
    app.mount('#app')
  }
}

// Start the initialization
;(async function () {
  await initializeApp()
})()
