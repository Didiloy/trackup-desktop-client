<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import toggle_sidebar_icon from '@/assets/icons/toggle-sidebar.svg?raw'
import { useRoute, useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import ChronosButton from '@/components/chronos/ChronosButton.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const showMembersAsideToggle = computed(
    () => typeof route.name === 'string' && route.name.startsWith('Server')
)
const isMembersAsideVisible = computed(() => route.query.members === 'true')
const server_store = useServerStore()
const pageTitle = computed(() => {
    if (showMembersAsideToggle.value) {
        const serverName = server_store.getName || ''
        return `${t('navigation.server')} - ${serverName}`
    }
    return t('navigation.home')
})

onMounted(() => {
    handleWindowControls()
})

function handleWindowControls(): void {
    const minButton = document.getElementById('min-button')
    const maxButton = document.getElementById('max-button')
    const closeButton = document.getElementById('close-button')
    const devToolsButton = document.getElementById('devtools-button')

    if (devToolsButton) {
        devToolsButton.addEventListener('click', () => {
            window.api.window.openDevTools()
        })
    }
    if (minButton) {
        minButton.addEventListener('click', () => {
            window.api.window.minimize()
        })
    }

    if (maxButton) {
        maxButton.addEventListener('click', () => {
            window.api.window.maximize()
        })
    }

    if (closeButton) {
        closeButton.addEventListener('click', async () => {
            window.api.window.close()
        })
    }
}

function handleToggleMembersAside(): void {
    const current = route.query.members === 'true'
    router.replace({ query: { ...route.query, members: current ? 'false' : 'true' } })
}
</script>
<template>
    <nav
        id="TopAside"
        class="flex items-center justify-between w-full h-8 min-h-8 pl-2 rounded-lg bg-surface-200"
    >
        <div>
            <span class="">{{ t('app.title') }}</span>
        </div>
        <div>
            <span class="">{{ pageTitle }}</span>
        </div>
        <div
            id="window-controls"
            class="flex items-center justify-center h-full w-fit bg-surface-200"
        >
            <div class="h-full flex items-center justify-center px-1">
                <ChronosButton />
            </div>
            <div
                v-if="showMembersAsideToggle"
                id="toggle-sidebar-button"
                class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
                :title="t('common.actions.toggle_sidebar')"
                @click="handleToggleMembersAside"
            >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span
                    class="icon inline-flex items-center justify-center w-1/2 h-1/2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
                    :class="isMembersAsideVisible ? 'text-primary-600' : 'text-gray-600'"
                    aria-hidden="true"
                    v-html="toggle_sidebar_icon"
                />
            </div>
            <div
                id="devtools-button"
                class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
                :title="t('common.actions.devtools')"
            >
                <i class="pi pi-cog"></i>
            </div>
            <div
                id="min-button"
                class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
                :title="t('common.actions.minimize')"
            >
                <i class="pi pi-minus"></i>
            </div>
            <div
                id="max-button"
                class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-surface-400 hover:cursor-pointer text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-gray-50"
                :title="t('common.actions.maximize')"
            >
                <i class="pi pi-sort"></i>
            </div>
            <div
                id="close-button"
                class="h-full w-11 flex justify-center items-center bg-surface-200 hover:bg-red-500 hover:cursor-pointer text-gray-600 hover:text-white dark:text-gray-400"
                :title="t('common.actions.close')"
            >
                <i class="pi pi-times"></i>
            </div>
        </div>
    </nav>
</template>
<style scoped>
#TopAside {
    -webkit-app-region: drag;
}

#window-controls {
    -webkit-app-region: no-drag;
}

.icon :deep(path),
.icon :deep(circle),
.icon :deep(rect),
.icon :deep(polygon),
.icon :deep(ellipse),
.icon :deep(line),
.icon :deep(polyline) {
    stroke: currentColor !important;
}
</style>
