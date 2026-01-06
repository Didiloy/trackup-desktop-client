import './style/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from '@/App.vue'
import { TrackupPreset } from '@/style/preset'
import { createPinia } from 'pinia'
import router from '@/router/router'
/* import font awesome icon component */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import { i18n, loadLanguageAsync } from '@/i18n'
import { ToastService } from 'primevue'

const app = createApp(App)

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: TrackupPreset,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark'
        }
    }
})
app.use(ToastService)
app.use(router)

app.component('FontAwesomeIcon', FontAwesomeIcon)
library.add(fas, far, fab)

const pinia = createPinia()
app.use(pinia)

app.use(i18n)

// Function to initialize app with the correct language
async function initializeApp(): Promise<void> {
    try {
        // If we have preferences with a language setting, use it
        const locale = i18n.global.locale.value // Get value from ref (Composition API mode)

        // Load the language
        const messages = await loadLanguageAsync(locale)
        if (messages) {
            i18n.global.setLocaleMessage(locale, messages)
            i18n.global.locale.value = locale
        }

        // Mount the app after language is loaded
        app.mount('#app')
    } catch (error) {
        // If we can't load preferences, fall back to default behavior
        const locale = i18n.global.locale.value // Get value from ref (Composition API mode)
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
    document.title = i18n.global.t('app.title')
})()
