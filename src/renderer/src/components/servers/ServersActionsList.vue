<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'
import { type Component, computed } from 'vue'
import ActivityIcon from '@/components/common/icons/ActivityIcon.vue'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'
import SessionIcon from '@/components/common/icons/SessionIcon.vue'
import Icon from '@/components/common/icons/Icon.vue'
import TreeBranchIcon from '@/components/common/icons/TreeBranchIcon.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const router = useRouter()
const route = useRoute()
const server_store = useServerStore()
const { t } = useI18n()

interface ServerActionChild {
    id: string
    label: string
    icon?: Component | string
    routeNames: string[] // Routes that match this child
}

interface ServerAction {
    id: string
    label: string
    icon?: Component | string
    routeName?: string
    description?: string
    childRoutes?: string[] // Profile routes that fall under this action
    children?: ServerActionChild[] // Sub-items to display when on a child route
}

const actions = computed<ServerAction[]>(() => {
    const baseActions: ServerAction[] = [
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
            routeName: 'ServerActivities',
            childRoutes: ['ServerActivityProfile', 'ServerActivityMetadataProfile'],
            children: [
                {
                    id: 'activity-profile',
                    label: t('views.server_activities.profile'),
                    icon: 'pi pi-id-card',
                    routeNames: ['ServerActivityProfile', 'ServerActivityMetadataProfile']
                }
            ]
        },
        {
            id: 'members',
            label: t('views.server_members.title_base'),
            icon: MemberIcon,
            routeName: 'ServerMembers',
            childRoutes: ['ServerMemberProfile'],
            children: [
                {
                    id: 'member-profile',
                    label: t('views.server_members.profile'),
                    icon: 'pi pi-id-card',
                    routeNames: ['ServerMemberProfile']
                }
            ]
        },
        {
            id: 'sessions',
            label: t('views.server_sessions.title_base'),
            icon: SessionIcon,
            routeName: 'ServerSessions',
            childRoutes: ['ServerSessionProfile'],
            children: [
                {
                    id: 'session-profile',
                    label: t('views.server_sessions.profile'),
                    icon: 'pi pi-id-card',
                    routeNames: ['ServerSessionProfile']
                }
            ]
        },
        {
            id: 'enum-definitions',
            label: t('views.server_enum_definitions.title'),
            icon: 'pi pi-list',
            routeName: 'ServerDefinitions',
            childRoutes: ['ServerEnumDefinitionProfile'],
            children: [
                {
                    id: 'enum-profile',
                    label: t('views.server_enum_definitions.profile.title'),
                    icon: 'pi pi-id-card',
                    routeNames: ['ServerEnumDefinitionProfile']
                }
            ]
        }
    ]

    if (server_store.isOwnership) {
        baseActions.push({
            id: 'settings',
            label: t('views.server_settings.title'),
            icon: 'pi pi-cog',
            routeName: 'ServerSettings'
        })
    }

    return baseActions
})

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

function isActionExpanded(action: ServerAction): boolean {
    if (!action.childRoutes) return false
    return action.childRoutes.includes(route.name as string)
}

function isChildActive(child: ServerActionChild): boolean {
    return child.routeNames.includes(route.name as string)
}
</script>
<template>
    <div class="flex flex-col items-start gap-1 w-full h-full bg-transparent p-2">
        <template v-for="a in actions" :key="a.id">
            <!-- Parent action button -->
            <button
                type="button"
                class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-200 text-left cursor-pointer"
                :class="{
                    'bg-surface-200 font-semibold': isActionActive(a) || isActionExpanded(a)
                }"
                @click="onActionClick(a)"
            >
                <Icon :icon="a.icon" />
                <span class="text-sm text-surface-900">{{ a.label }}</span>
            </button>

            <!-- Child items (sub-tree) -->
            <TransitionWrapper name="slide-down" mode="out-in">
                <div v-if="isActionExpanded(a) && a.children" class="w-full pl-2 flex flex-col">
                    <div
                        v-for="child in a.children"
                        :key="child.id"
                        class="flex items-center gap-1 text-sm text-surface-700"
                    >
                        <!-- Tree connector icon -->
                        <TreeBranchIcon class="text-surface-400 ml-2" />

                        <div
                            class="flex items-center gap-2 px-2 py-1.5 rounded-md flex-1"
                            :class="{
                                'text-primary-500 font-medium': isChildActive(child),
                                'text-surface-600': !isChildActive(child)
                            }"
                        >
                            <Icon :icon="child.icon" class="text-xs" />
                            <span>{{ child.label }}</span>
                        </div>
                    </div>
                </div>
            </TransitionWrapper>
        </template>
    </div>
</template>
