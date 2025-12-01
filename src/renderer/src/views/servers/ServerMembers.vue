<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import MembersHeader from '@/components/members/MembersHeader.vue'
import MembersCardGrid from '@/components/members/MembersCardGrid.vue'
import { useToast } from 'primevue/usetoast'
import { copyKeyToClipBoard } from '@/utils'
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

const server_store = useServerStore()
const toast = useToast()
const i18n = useI18n()

const searchQuery = ref('')
const searchField = ref<'nickname' | 'email'>('nickname')
const joinedStartDate = ref<Date | undefined>(undefined)
const joinedEndDate = ref<Date | undefined>(undefined)
const loading = ref(false)

const members = computed<IServerMember[]>(() => server_store.getMembers || [])

const filteredMembers = computed(() => {
    let result = [...members.value]

    // Filter by search query based on selected field
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter((m) => {
            if (searchField.value === 'nickname') {
                return m.nickname.toLowerCase().includes(query)
            } else {
                return m.user_email.toLowerCase().includes(query)
            }
        })
    }

    // Filter by joined date range
    if (joinedStartDate.value || joinedEndDate.value) {
        result = result.filter((m) => {
            const memberDate = new Date(m.created_at)
            if (joinedStartDate.value && memberDate < joinedStartDate.value) {
                return false
            }
            if (joinedEndDate.value && memberDate > joinedEndDate.value) {
                return false
            }
            return true
        })
    }

    return result
})

async function handleInvite(): Promise<void> {
    if (!server_store.getInvitationCode) return
    await copyKeyToClipBoard(server_store.getInvitationCode, toast, i18n)
}
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <MembersHeader
            :total-members="server_store.getMembers?.length || 0"
            @update:search="searchQuery = $event"
            @update:search-field="searchField = $event"
            @update:joined-start-date="joinedStartDate = $event"
            @update:joined-end-date="joinedEndDate = $event"
            @invite="handleInvite"
        />

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <MembersCardGrid :members="filteredMembers" :loading="loading" />
        </div>
    </div>
</template>
