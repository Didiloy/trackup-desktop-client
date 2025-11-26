<script setup lang="ts">
import ServersList from '@/components/servers/list/ServersList.vue'
import ServersActionsList from '@/components/servers/ServersActionsList.vue'
import ProfileButton from '@/components/ProfileButton.vue'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { useServerStore } from '@/stores/server'
import { useServerTypeCRUD } from '@/composables/servers/useServerTypeCRUD'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { copyKeyToClipBoard } from '@/utils'

const route = useRoute()
const hasServerActions = computed(
    () => typeof route.name === 'string' && route.name.startsWith('Server')
)

const server_store = useServerStore()

const { getServerTypeById } = useServerTypeCRUD()
const serverTypeName = ref<string>('')

async function refreshServerTypeName(): Promise<void> {
    const id = server_store.getServerTypePublicId
    if (!id) {
        serverTypeName.value = ''
        return
    }
    const res = await getServerTypeById(id)
    serverTypeName.value = res.data?.name || ''
}

watch(
    () => server_store.getServerTypePublicId,
    () => {
        void refreshServerTypeName()
    },
    { immediate: true }
)

const toast = useToast()
const i18n = useI18n()
async function copyInvite(): Promise<void> {
    if (!server_store.getInvitationCode) return
    await copyKeyToClipBoard(server_store.getInvitationCode, toast, i18n)
}
</script>

<template>
    <aside
        id="ServersAside"
        class="flex flex-row items-center justify-start h-full bg-surface-200 transition-all duration-300 ease-in-out overflow-hidden select-none"
        :class="[hasServerActions ? 'w-100 min-w-64' : 'w-16 min-w-16']"
    >
        <div class="flex flex-col items-center w-16 min-w-16 h-full my-2 bg-surface-200 rounded-lg">
            <div class="flex flex-col items-center gap-2 py-2 shrink-0 mx-2">
                <ProfileButton />
                <div class="w-8 h-px bg-surface-400 my-1"></div>
            </div>
            <ServersList />
        </div>
        <TransitionWrapper name="fade">
            <div v-if="hasServerActions" class="flex-1 h-full">
                <div
                    class="w-full h-full bg-surface-100 rounded-l-2xl overflow-hidden flex flex-col"
                >
                    <!-- Header with banner and server meta -->
                    <div class="relative w-full" style="height: 120px; min-height: 120px">
                        <TransitionWrapper name="slide-fade">
                            <div v-if="server_store.getBanner" class="absolute inset-0">
                                <img
                                    :src="server_store.getBanner"
                                    alt="Server banner"
                                    class="w-full h-full object-cover not-draggable"
                                />
                            </div>
                            <div
                                v-else
                                class="absolute inset-0"
                                style="background: var(--gradient-primary)"
                            ></div>
                        </TransitionWrapper>

                        <!-- Contrast overlays -->
                        <div class="absolute inset-0 backdrop-blur-[2px] bg-black/0"></div>
                        <div
                            class="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/70 via-black/40 to-transparent"
                        ></div>
                        <div class="absolute bottom-0 left-0 right-0 p-3">
                            <div class="text-white font-semibold text-sm truncate text-elevated">
                                {{ server_store.getName || 'Server' }}
                            </div>
                            <div class="text-white/90 text-xs text-elevated">
                                {{ serverTypeName }}
                            </div>
                            <div class="mt-2 flex items-center gap-2 absolute bottom-0 right-0 p-3">
                                <button
                                    v-if="server_store.getInvitationCode"
                                    type="button"
                                    class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-white text-2xs shadow-sm hover:shadow-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.99]"
                                    :style="{ background: 'var(--gradient-primary)' }"
                                    @click="copyInvite"
                                >
                                    <i class="pi pi-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Actions list -->
                    <div class="flex-1">
                        <ServersActionsList class="h-full" />
                    </div>
                </div>
            </div>
        </TransitionWrapper>
    </aside>
</template>

<style scoped>
.text-elevated {
    text-shadow:
        0 1px 2px rgba(0, 0, 0, 0.85),
        0 0 8px rgba(0, 0, 0, 0.35);
}
</style>
