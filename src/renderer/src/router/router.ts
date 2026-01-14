import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'
import Home from '@/views/app/Home.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('@/views/app/Application.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Home',
                component: Home
            },
            {
                path: 'servers/:id/stats',
                name: 'ServerStats',
                component: () => import('@/views/servers/ServerStats.vue')
            },
            {
                path: 'servers/:id/profile',
                name: 'ServerProfile',
                component: () => import('@/views/servers/ServerProfile.vue')
            },
            {
                path: 'servers/:id/settings',
                name: 'ServerSettings',
                component: () => import('@/views/servers/ServerSettings.vue')
            },
            {
                path: 'servers/:id/activities',
                name: 'ServerActivities',
                component: () => import('@/views/servers/ServerActivities.vue')
            },
            {
                path: 'servers/:id/activities/:activityId',
                name: 'ServerActivityProfile',
                component: () => import('@/views/activities/ActivityProfile.vue')
            },
            {
                path: 'servers/:id/activities/:activityId/metadata/:metadataDefinitionId',
                name: 'ServerActivityMetadataProfile',
                component: () => import('@/views/activities/metadata/ActivityMetadataProfile.vue')
            },
            {
                path: 'servers/:id/members',
                name: 'ServerMembers',
                component: () => import('@/views/servers/ServerMembers.vue')
            },
            {
                path: 'servers/:id/members/:memberId',
                name: 'ServerMemberProfile',
                component: () => import('@/views/members/MemberProfile.vue')
            },
            {
                path: 'servers/:id/sessions',
                name: 'ServerSessions',
                component: () => import('@/views/servers/ServerSessions.vue')
            },
            {
                path: 'servers/:id/enum-definitions',
                name: 'ServerEnumDefinitions',
                component: () => import('@/views/servers/ServerEnumDefinitions.vue')
            },
            {
                path: 'servers/:id/enum-definitions/:enumDefinitionId',
                name: 'ServerEnumDefinitionProfile',
                component: () => import('@/views/enum-definitions/EnumDefinitionProfile.vue')
            },
            {
                path: 'servers/:id/sessions/:sessionId',
                name: 'ServerSessionProfile',
                component: () => import('@/views/sessions/SessionProfile.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginOrSignup.vue')
    },
    {
        path: '/auth/terms',
        name: 'AcceptTerms',
        component: () => import('@/views/auth/AcceptTerms.vue'),
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
    } else if (user_store.hasUser) {
        // Helper to check terms acceptance safely
        const termsAccepted = (user_store.user?.user_metadata as { terms_accepted?: boolean })?.terms_accepted

        if (!termsAccepted && to.name !== 'AcceptTerms') {
            // If logged in but terms not accepted, redirect to terms page
            next({ name: 'AcceptTerms' })
        } else if (termsAccepted && to.name === 'AcceptTerms') {
            // If terms already accepted, don't allow visiting terms page
            next({ name: 'Home' })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
