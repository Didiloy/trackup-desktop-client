<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import MembersFilterBar from '@/components/members/MembersFilterBar.vue'
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
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ i18n.t('views.server_members.title') }}
            </h2>
            <div v-if="server_store.isOwnership" class="flex flex-row items-center justify-center">
                <Button
                    :label="i18n.t('views.server_members.invite_members')"
                    icon="pi pi-user-plus"
                    size="small"
                    @click="handleInvite"
                />
            </div>
        </div>

        <div class="w-full px-2 pb-2">
            <MembersFilterBar
                :search="search_query"
                :search-field="search_field"
                :joined-start-date="joined_start_date"
                :joined-end-date="joined_end_date"
                :count="filteredMembers.length"
                @update:search="(v) => (search_query = v)"
                @update:search-field="(v) => (search_field = v)"
                @update:joined-start-date="(v) => (joined_start_date = v)"
                @update:joined-end-date="(v) => (joined_end_date = v)"
            />
        </div>

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <MembersCardGrid :members="filteredMembers" :loading="loading" />
        </div>
    </div>
</template>
