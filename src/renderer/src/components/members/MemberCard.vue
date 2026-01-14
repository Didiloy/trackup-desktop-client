<script setup lang="ts">
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { getInitials } from '@/utils'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import CurrentUserBadge from '@/components/common/badges/CurrentUserBadge.vue'
import RoleBadge from '@/components/common/badges/RoleBadge.vue'

const props = defineProps<{
    member: IServerMember
}>()

const { navigateToMemberProfile } = useMemberNavigation()
const user_store = useUserStore()

const is_current_user = computed(() => {
    return props.member.user_email === user_store.getEmail
})

const handleNavigateToProfile = async (): Promise<void> => {
    await navigateToMemberProfile(props.member.public_id)
}
</script>

<template>
    <div
        class="group relative rounded-2xl border border-surface-200 bg-white hover:bg-surface-50 hover:shadow-md hover:border-primary-200 transition-all duration-300 overflow-hidden cursor-pointer p-5 flex items-center gap-4 w-full"
        @click="handleNavigateToProfile"
    >
        <!-- Avatar -->
        <div class="relative shrink-0">
            <div
                class="w-14 h-14 rounded-full overflow-hidden bg-primary-200 ring-2 ring-white shadow-sm"
            >
                <img
                    v-if="member.avatar_url"
                    :src="member.avatar_url"
                    class="w-full h-full object-cover"
                    alt="Member Avatar"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-base font-bold text-primary-800"
                >
                    {{ getInitials(member.nickname, { mode: 'all', maxInitials: 2 }) }}
                </div>
            </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <h3
                    v-tooltip.top="member.nickname"
                    class="text-base font-semibold text-surface-900 truncate"
                >
                    {{ member.nickname }}
                </h3>
                <RoleBadge :role-name="member.role_name" />
                <!-- Current user badge -->
                <CurrentUserBadge :show="is_current_user" />
            </div>
        </div>
    </div>
</template>
