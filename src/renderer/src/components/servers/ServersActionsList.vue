<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import ActivityIcon from '@/components/common/icons/ActivityIcon.vue'
import MembersIcon from '@/components/common/icons/MembersIcon.vue'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'

const router = useRouter()
const route = useRoute()
const server_store = useServerStore()
const { t } = useI18n()

interface ServerAction {
    id: string
    label: string
    icon?: Component | string
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
        label: t('views.server_activities.title_base'),
        icon: ActivityIcon,
        routeName: 'ServerActivities'
    },
    {
        id: 'members',
        label: t('views.server_members.title_base'),
        icon: MembersIcon,
        routeName: 'ServerMembers'
    },
    {
        id: 'sessions',
        label: t('views.server_sessions.title_base'),
        icon: SessionIcon,
        routeName: 'ServerSessions'
    },
    {
        id: 'definitions',
        label: t('views.server_enum_definitions.title'),
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
            <!-- Si l'icône est une string (classe PrimeIcons), utiliser <i> -->
            <i v-if="typeof a.icon === 'string'" :class="a.icon" />
            <!-- Si l'icône est un composant Vue, utiliser <component> -->
            <component :is="a.icon" v-else />
            <span class="text-sm text-surface-900">{{ a.label }}</span>
        </button>
    </div>
</template>
