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
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginOrSignup.vue')
    },
    {
        path: '/servers/:id/stats',
        name: 'ServerStats',
        component: () => import('@/views/servers/ServerStats.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/profile',
        name: 'ServerProfile',
        component: () => import('@/views/servers/ServerProfile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/settings',
        name: 'ServerSettings',
        component: () => import('@/views/servers/ServerSettings.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/widgets',
        name: 'ServerWidgets',
        component: () => import('@/views/servers/ServerWidgets.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/activities',
        name: 'ServerActivities',
        component: () => import('@/views/servers/ServerActivities.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/activities/:activityId',
        name: 'ServerActivityProfile',
        component: () => import('@/views/servers/activities/ServerActivityProfile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/members',
        name: 'ServerMembers',
        component: () => import('@/views/servers/ServerMembers.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/servers/:id/sessions',
        name: 'ServerSessions',
        component: () => import('@/views/servers/ServerSessions.vue'),
        meta: { requiresAuth: true }
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
            name: 'Login',
            query: { redirect: to.fullPath }
        })
    } else {
        next()
    }
})

export default router
