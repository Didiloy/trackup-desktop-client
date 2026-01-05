<script setup lang="ts">
import ServersAside from '@/components/asides/ServersAside.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import MembersAside from '@/components/asides/MembersAside.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isMembersAsideVisible = computed(() => route.query.members === 'true')
const isServerActionsAsideVisible = computed(
    () => route.name && typeof route.name === 'string' && route.name.startsWith('Server')
)
</script>

<template>
    <div
        id="Application"
        class="w-full h-full flex flex-row justify-between items-center pr-2 pb-2 bg-surface-200"
    >
        <ServersAside />
        <main
            class="grow bg-surface-50 h-full w-full rounded-r-xl flex flex-row overflow-hidden p-6"
            :class="{ 'rounded-l-xl': !isServerActionsAsideVisible }"
        >
            <router-view v-slot="{ Component, route: currentRoute }">
                <TransitionWrapper name="fade" mode="out-in" :duration="0.25">
                    <component :is="Component" :key="currentRoute.path" />
                </TransitionWrapper>
            </router-view>
        </main>
        <TransitionWrapper name="panel-right">
            <MembersAside
                v-if="isMembersAsideVisible"
                key="members-aside"
                class="h-full w-64 min-w-64"
            />
        </TransitionWrapper>
    </div>
</template>

<style scoped></style>
