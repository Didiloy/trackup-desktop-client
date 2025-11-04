import { createMemoryHistory, createRouter } from 'vue-router'
import Home from '@/views/Home.vue'
import Server from '@/views/Server.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/servers/:id', component: Server },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
