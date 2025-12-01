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

const search_query = ref('')
const search_field = ref<'nickname' | 'email'>('nickname')
const joined_start_date = ref<Date | undefined>(undefined)
const joined_end_date = ref<Date | undefined>(undefined)
const loading = ref(false)

const members = ref<IServerMember[]>(server_store.getMembers || [])

const filteredMembers = computed(() => {
    let result = [...members.value]

    // Filter by search query based on selected field
    if (search_query.value) {
        const query = search_query.value.toLowerCase()
        result = result.filter((m) => {
            if (search_field.value === 'nickname') {
                return m.nickname.toLowerCase().includes(query)
            } else {
                return m.user_email.toLowerCase().includes(query)
            }
        })
    }

    // Filter by joined date range
    if (joined_start_date.value || joined_end_date.value) {
        result = result.filter((m) => {
            const memberDate = new Date(m.created_at)
            if (joined_start_date.value && memberDate < joined_start_date.value) {
                return false
            }
            return !(joined_end_date.value && memberDate > joined_end_date.value)
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
            @update:search="search_query = $event"
            @update:search-field="search_field = $event"
            @update:joined-start-date="joined_start_date = $event"
            @update:joined-end-date="joined_end_date = $event"
            @invite="handleInvite"
        />

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <MembersCardGrid :members="filteredMembers" :loading="loading" />
        </div>
    </div>
</template>
