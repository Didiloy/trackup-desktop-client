<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'
import ServerCreateEditJoinDialog from '@/components/servers/create-join/ServerCreateEditJoinDialog.vue'
import type { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'

const { t } = useI18n()
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()

const showEditDialog = ref(false)

const isOwner = computed(() => server_store.isOwnership === true)

function handleRefresh(): void {
    if (server_store.getPublicId) {
        server_stats_store.fetchAll(server_store.getPublicId)
    }
}

function openEdit(): void {
    if (!isOwner.value) return
    showEditDialog.value = true
}

function handleServerUpdated(updated: IServer): void {
    // update store with refreshed server
    server_store.setServer(updated)
}
</script>

<template>
    <div
        class="relative rounded-3xl p-6 mb-6 overflow-hidden ring-1 ring-surface-200/40"
        :class="
            server_store.getBanner
                ? 'bg-black/40'
                : 'bg-linear-to-br from-primary-500/10 via-secondary-500/5 to-surface-0'
        "
    >
        <div
            v-if="server_store.getBanner"
            class="absolute inset-0 transition-opacity duration-500 rounded-2xl bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${server_store.getBanner})` }"
        ></div>
        <div v-if="server_store.getBanner" class="absolute inset-0 bg-black/50"></div>

        <div class="relative z-10 flex flex-wrap items-center gap-6">
            <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold bg-surface-50 text-primary-600 ring-1 ring-white/50 shadow-lg overflow-hidden"
            >
                <img
                    v-if="server_store.getLogo"
                    :src="server_store.getLogo!"
                    :alt="server_store.getName || ''"
                    class="w-full h-full object-cover"
                />
                <span v-else>{{ server_store.getName?.charAt(0)?.toUpperCase() }}</span>
            </div>

            <div class="flex-1 min-w-[220px]">
                <h1
                    class="text-3xl font-bold"
                    :class="
                        server_store.getBanner
                            ? 'text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]'
                            : 'text-surface-900'
                    "
                >
                    {{ server_store.getName || t('common.fields.none') }}
                </h1>
                <p
                    class="text-sm mt-1 max-w-2xl line-clamp-2"
                    :class="
                        server_store.getBanner
                            ? 'text-white/90 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]'
                            : 'text-surface-500'
                    "
                >
                    {{ server_store.getDescription || t('common.fields.description') }}
                </p>
            </div>

            <div class="flex flex-wrap gap-3">
                <Button
                    icon="pi pi-refresh"
                    :label="t('common.actions.refresh')"
                    size="small"
                    rounded
                    :text="!!server_store.getBanner"
                    :severity="server_store.getBanner ? 'secondary' : undefined"
                    :loading="server_stats_store.isLoading"
                    :pt="
                        server_store.getBanner
                            ? {
                                  label: { class: 'text-surface-100' },
                                  icon: { class: 'text-surface-100' }
                              }
                            : {}
                    "
                    @click="handleRefresh"
                />
                <Button
                    v-if="isOwner"
                    icon="pi pi-pencil"
                    :label="t('common.actions.edit')"
                    size="small"
                    severity="help"
                    class="shadow"
                    :pt="
                        server_store.getBanner
                            ? {
                                  label: { class: 'text-surface-100' },
                                  icon: { class: 'text-surface-100' }
                              }
                            : {}
                    "
                    @click="openEdit"
                />
            </div>
        </div>

        <!-- Edit Dialog -->
        <ServerCreateEditJoinDialog
            v-model="showEditDialog"
            mode="edit"
            @server-action="handleServerUpdated"

        />
    </div>
</template>
