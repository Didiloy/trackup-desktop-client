<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type {
    ISessionMember,
    ISessionCreator
} from '@shared/contracts/interfaces/entities/session.interfaces'
import { useServerStore } from '@/stores/server'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'
import MemberIcon from '@/components/common/icons/MemberIcon.vue'

interface Props {
    participants: ISessionMember[]
    creator?: ISessionCreator
}

defineProps<Props>()
const { t } = useI18n()
const server_store = useServerStore()
const { navigateToMemberProfile } = useMemberNavigation()

function isCreator(participant: ISessionMember, creator?: ISessionCreator): boolean {
    return !!creator && participant.public_id === creator.member_public_id
}

async function goToMemberProfile(participant: ISessionMember): Promise<void> {
    await navigateToMemberProfile(participant.public_id)
}
</script>

<template>
    <div class="bg-surface-0 border border-surface-200 rounded-2xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <MemberIcon class="text-primary-500" />
            {{ t('views.server_sessions.session_details.participants') }}
            <Badge :value="participants.length" severity="secondary" class="ml-auto" />
        </h3>

        <div class="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            <div
                v-for="participant in participants"
                :key="participant.public_id"
                class="flex items-center gap-3 p-2 m-2 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer hover:shadow"
                :class="{ 'bg-primary-50/50': isCreator(participant, creator) }"
                @click="goToMemberProfile(participant)"
            >
                <Avatar
                    :image="
                        server_store.getMemberById(participant.public_id)?.avatar_url ? participant : undefined
                    "
                    :label="
                        !server_store.getMemberById(participant.public_id)?.avatar_url
                            ? participant.nickname.charAt(0).toUpperCase()
                            : undefined
                    "
                    size="large"
                    shape="circle"
                    class="bg-surface-200 text-surface-600 border border-surface-300"
                />
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-surface-900 truncate flex items-center gap-2">
                        <span class="text-sm text-surface-500 hover:underline cursor-pointer">
                            {{
                                server_store.getMemberById(participant.public_id)?.nickname ??
                                participant.nickname
                            }}
                        </span>
                        <i
                            v-if="isCreator(participant, creator)"
                            v-tooltip.top="t('common.fields.creator')"
                            class="pi pi-star-fill text-yellow-500 text-xs"
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--surface-300);
    border-radius: 20px;
}
</style>
