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
const sortBy = ref('joined_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const loading = ref(false)

const members = computed<IServerMember[]>(() => server_store.getMembers || [])

const filteredMembers = computed(() => {
    loading.value = true
    let result = [...members.value]

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
            (m) =>
                m.nickname.toLowerCase().includes(query) ||
                m.user_email.toLowerCase().includes(query)
        )
    }
    loading.value = false

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
    <div class="flex flex-col items-center justify-start w-full h-full">
        <MembersHeader
            :total-members="server_store.getMembers?.length || 0"
            @update:search="searchQuery = $event"
            @update:sort="sortBy = $event"
            @invite="handleInvite"
        />

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <MembersCardGrid :members="filteredMembers" :loading="loading"/>
        </div>
    </div>
</template>
