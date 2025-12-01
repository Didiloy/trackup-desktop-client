<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import MembersHeader from '@/components/members/MembersHeader.vue'
import MemberCard from '@/components/members/MemberCard.vue'
import { useToast } from 'primevue/usetoast'
import { copyKeyToClipBoard } from '@/utils'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

const { t } = useI18n()
const server_store = useServerStore()

const toast = useToast()
const i18n = useI18n()
const searchQuery = ref('')
const sortBy = ref('joined_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const members = ref<IServerMember[]>(server_store.getMembers || [])

const filteredMembers = computed(() => {
    let result = [...members.value]

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
            (m) =>
                m.nickname.toLowerCase().includes(query) ||
                m.user_email.toLowerCase().includes(query)
        )
    }

    return result.sort((a, b) => {
        const aValue = a[sortBy.value]
        const bValue = b[sortBy.value]

        if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
        return 0
    })
})

async function handleInvite(): Promise<void> {
    if (!server_store.getInvitationCode) return
    await copyKeyToClipBoard(server_store.getInvitationCode, toast, i18n)
}
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <MembersHeader
            :total-members="server_store.getMembers?.length || 0"
            @update:search="searchQuery = $event"
            @update:sort="sortBy = $event"
            @invite="handleInvite"
        />

        <!-- Empty State -->
        <div
            v-if="!server_store.getMembers?.length"
            class="flex flex-col items-center justify-center py-20 text-surface-500"
        >
            <i class="pi pi-users text-4xl mb-4 opacity-50"></i>
            <p class="text-lg font-medium">{{ t('common.filters.no_results') }}</p>
            <p class="text-sm opacity-75">{{ t('views.server_members.no_members') }}</p>
        </div>


        <!-- Members Grid -->
        <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-6"
        >
            <MemberCard
                v-for="member in filteredMembers"
                :key="member.public_id"
                :member="member"
            />
        </div>
    </div>
</template>
