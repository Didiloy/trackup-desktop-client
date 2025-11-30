<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import { useServerMembers } from '@/composables/server/useServerMembers'
import ServerMembersHeader from '@/components/server/members/ServerMembersHeader.vue'
import ServerMemberCard from '@/components/server/members/ServerMemberCard.vue'
import { useToast } from 'primevue/usetoast'
import { copyKeyToClipBoard } from '@/utils'

const { t } = useI18n()
const server_store = useServerStore()
const { filteredMembers, total, loading, searchQuery, sortBy, fetchMembers } = useServerMembers()

const serverId = computed(() => server_store.getPublicId)

onMounted(() => {
    if (serverId.value) {
        fetchMembers(serverId.value)
    }
})

const toast = useToast()
const i18n = useI18n()
async function handleInvite() {
    if (!server_store.getInvitationCode) return
    await copyKeyToClipBoard(server_store.getInvitationCode, toast, i18n)
}

const handleRefresh = () => {
    if (serverId.value) {
        fetchMembers(serverId.value)
    }
}
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <ServerMembersHeader
            :total-members="total"
            :loading="loading"
            @update:search="searchQuery = $event"
            @update:sort="sortBy = $event"
            @invite="handleInvite"
        />

        <!-- Loading State -->
        <div
            v-if="loading && !filteredMembers.length"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <div
                v-for="i in 8"
                :key="i"
                class="h-24 rounded-2xl bg-surface-100 animate-pulse"
            ></div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!filteredMembers.length"
            class="flex flex-col items-center justify-center py-20 text-surface-500"
        >
            <i class="pi pi-users text-4xl mb-4 opacity-50"></i>
            <p class="text-lg font-medium">{{ t('common.filters.no_results') }}</p>
            <p class="text-sm opacity-75">{{ t('views.server_members.no_members') }}</p>
        </div>

        <!-- Members Grid -->
        <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10"
        >
            <ServerMemberCard
                v-for="member in filteredMembers"
                :key="member.public_id"
                :member="member"
                @refresh="handleRefresh"
            />
        </div>
    </div>
</template>
