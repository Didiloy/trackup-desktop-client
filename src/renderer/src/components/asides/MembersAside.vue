<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MembersList from '../members/list/MembersList.vue'
import { useServerStore } from '@/stores/server'

const { t } = useI18n()
const server_store = useServerStore()
const members = server_store.getMembers
</script>

<template>
    <aside class="w-64 min-w-64 h-full bg-surface-200 rounded-r-xl overflow-hidden">
        <div class="h-full flex flex-col">
            <div
                class="px-3 py-2 text-sm font-semibold text-surface-800 border-b border-surface-300"
            >
                {{ t('userInterface.membersAside.title') }}
                {{ members?.length ? `- ${members.length}` : '' }}
            </div>
            <div class="flex-1 overflow-y-auto">
                <MembersList />
            </div>
        </div>
    </aside>
</template>
