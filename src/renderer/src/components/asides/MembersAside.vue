<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MembersList from '../members/list/MembersList.vue'
import { useServerStore } from '@/stores/server'

const { t } = useI18n()
const server_store = useServerStore()
const members = server_store.getMembers

// compute the header using the existing title translation and a count-aware translation
const header = computed(() => {
    const title = t('views.members_aside.title')
    const count = members?.length ?? 0
    return count ? t('views.members_aside.title_with_count', { title, count }) : title
})
</script>

<template>
    <aside class="w-64 min-w-64 h-full bg-surface-200 rounded-r-xl overflow-hidden">
        <div class="h-full flex flex-col">
            <div
                class="px-3 py-2 text-sm font-semibold text-surface-800 border-b border-surface-300"
            >
                {{ header }}
            </div>
            <div class="flex-1 overflow-y-auto">
                <MembersList />
            </div>
        </div>
    </aside>
</template>
