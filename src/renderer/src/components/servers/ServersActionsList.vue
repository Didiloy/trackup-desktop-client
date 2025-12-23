<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const server_store = useServerStore()
const { t } = useI18n()

interface ServerAction {
    id: string
    label: string
    icon?: string
    routeName?: string
    description?: string
}

const actions: ServerAction[] = [
    {
        id: 'stats',
        label: t('views.server_stats.title'),
        icon: 'pi pi-chart-bar',
        routeName: 'ServerStats'
    },
    {
        id: 'server-profile',
        label: t('views.server_profile.title'),
        icon: 'pi pi-home',
        routeName: 'ServerProfile'
    },
    {
        id: 'activities',
        label: t('views.activity.title_base'),
        icon: 'pi pi-trophy',
        routeName: 'ServerActivities'
    },
    {
        id: 'members',
        label: t('views.server_members.title_base'),
        icon: 'pi pi-users',
        routeName: 'ServerMembers'
    },
    {
        id: 'sessions',
        label: t('views.server_sessions.title_base'),
        icon: 'pi pi-calendar',
        routeName: 'ServerSessions'
    },
    {
        id: 'definitions',
        label: t('views.server_definitions.title'),
        icon: 'pi pi-list',
        routeName: 'ServerDefinitions'
    },
    {
        id: 'settings',
        label: t('views.server_settings.title'),
        icon: 'pi pi-cog',
        routeName: 'ServerSettings'
    }
]

async function onActionClick(action: ServerAction): Promise<void> {
    // Navigate to the route if routeName is defined
    if (action.routeName) {
        await router.push({
            name: action.routeName,
            params: { id: server_store.getPublicId },
            query: { ...route.query }
        })
    }
}

function isActionActive(action: ServerAction): boolean {
    return route.name === action.routeName
}
</script>
<template>
    <div class="flex flex-col items-start gap-1 w-full h-full bg-transparent p-2">
        <button
            v-for="a in actions"
            :key="a.id"
            type="button"
            class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-200 text-left cursor-pointer"
            :class="{ 'bg-surface-200 font-semibold': isActionActive(a) }"
            @click="onActionClick(a)"
        >
            <i v-if="a.icon" :class="a.icon" class="text-surface-600"></i>
            <span class="text-sm text-surface-900">{{ a.label }}</span>
        </button>
    </div>
</template>
