import './style/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { TrackupPreset } from './style/preset'
import { createPinia } from 'pinia'
import { router } from './router'
import { createI18n } from 'vue-i18n'
import messages from '@/i18n/messages.json'

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

const i18n = createI18n({
  locale: 'fr',
  fallbackLocale: 'en',
  messages
})
app.use(i18n)

app.mount('#app')
