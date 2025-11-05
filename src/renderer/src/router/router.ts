import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'
import Home from '@/views/Home.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/servers/:id',
    name: 'Server',
    component: () => import('@/views/server/Server.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginOrSignup.vue')
  }
]

const router: Router = createRouter({
  history: createMemoryHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach(async (to, _, next) => {
  const user_store = useUserStore()
  // Check if the route requires authentication
  if (to.meta.requiresAuth && !user_store.hasUser) {
    // For other protected routes
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
