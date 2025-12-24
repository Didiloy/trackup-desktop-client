<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useServerStore } from '@/stores/server'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'

const server_store = useServerStore()
const { getMemberById } = useMemberCRUD()

const props = withDefaults(
    defineProps<{
        show?: boolean
        class?: string
        memberId?: string
    }>(),
    {
        show: true,
        class: 'top-4 right-4',
        memberId: undefined
    }
)

const localMemberNickname = ref<string | null>(null)

async function fetchMemberName(): Promise<void> {
    if (!props.memberId || !props.show) return

    // First, try to get from store
    const membersInStore = server_store.getMembers || []
    const memberInStore = membersInStore.find((m) => m.public_id === props.memberId)
    
    if (memberInStore) {
        localMemberNickname.value = memberInStore.nickname
        return
    }

    // If not in store, fetch from API
    const serverId = server_store.getPublicId
    if (!serverId) return

    try {
        const res = await getMemberById(serverId, props.memberId)
        if (res.data) {
            localMemberNickname.value = res.data.nickname
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    if (props.memberId) {
        void fetchMemberName()
    }
})

watch(
    () => props.memberId,
    (newId) => {
        if (newId) {
            void fetchMemberName()
        }
    }
)

const memberNickname = computed(() => localMemberNickname.value)
const isVisible = computed(() => props.show)
</script>

<template>
    <div
        v-if="isVisible && memberNickname"
        v-tooltip.top="memberNickname"
        class="absolute z-10"
        :class="props.class"
    >
        <div
            class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-100/80
            backdrop-blur-sm border border-surface-200/50 text-[10px] font-medium
            text-surface-500 hover:text-primary-500 hover:border-primary-200
            transition-colors cursor-pointer"
        >
            <i class="pi pi-user text-[9px]"></i>
            <router-link
                :to="{
                    name: 'ServerMemberProfile',
                    params: {
                        id: server_store.getPublicId,
                        memberId: props.memberId
                    }
                }"
                class="max-w-[80px] truncate uppercase tracking-wider"
            >
                {{ memberNickname }}
            </router-link>
        </div>
    </div>
</template>
