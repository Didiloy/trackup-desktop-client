<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'

const router = useRouter()
const route = useRoute()
const server_store = useServerStore()

interface ServerAction {
    id: string
    label: string
    icon?: string
    routeName?: string
    description?: string
}

const actions: ServerAction[] = [
    { id: 'overview', label: 'Aperçu', icon: 'pi pi-home', routeName: 'ServerOverview' },
    { id: 'activities', label: 'Activités', icon: 'pi pi-clock', routeName: 'ServerActivities' },
    { id: 'members', label: 'Membres', icon: 'pi pi-users', routeName: 'ServerMembers' },
    { id: 'sessions', label: 'Sessions', icon: 'pi pi-calendar', routeName: 'ServerSessions' },
    {
        id: 'server-profile',
        label: 'Profil du serveur',
        icon: 'pi pi-user',
        routeName: 'ServerProfile'
    },
    { id: 'widgets', label: 'Widgets', icon: 'pi pi-th-large', routeName: 'ServerWidgets' },
    { id: 'settings', label: 'Paramètres', icon: 'pi pi-cog', routeName: 'ServerSettings' }
]

function onActionClick(action: ServerAction): void {
    // Navigate to the route if routeName is defined
    if (action.routeName) {
        router.push({
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
