import './style/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { TrackupPreset } from './style/preset'
import { createPinia } from 'pinia'
import { router } from './router'

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

app.mount('#app')
