<script setup lang="ts">
import { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { getInitials } from '@/utils'

interface Props {
  member: IServerMember
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="w-6 h-6 rounded-full overflow-hidden bg-surface-300 flex items-center justify-center text-[10px] font-semibold text-surface-800"
    >
      <img
        v-if="member.avatar_url"
        :src="member.avatar_url"
        :alt="member.nickname"
        class="w-full h-full object-cover"
      />
      <span v-else>{{ getInitials(member.nickname, { mode: 'all', maxInitials: 2 }) }}</span>
    </div>
    <div class="text-sm text-surface-900">{{ member.nickname }}</div>
  </div>
</template>
