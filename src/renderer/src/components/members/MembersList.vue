<script setup lang="ts">
import { computed } from 'vue'
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'
import { getInitials } from '@/utils'

const server_store = useServerStore()
const { t } = useI18n()

const grouped = computed(() => {
  const members = server_store.getMembers
  if (!members) return []

  // Group members by role
  const byRole = members.reduce(
    (acc, member) => {
      const role = (member.role_name || 'Unknown').trim()
      if (!acc[role]) acc[role] = []
      acc[role].push(member)
      return acc
    },
    {} as Record<string, typeof members>
  )

  // Sort members by nickname/email
  const sortMembers = (a: (typeof members)[0], b: (typeof members)[0]): number =>
    a.nickname.toLowerCase().localeCompare(b.nickname.toLowerCase())

  // Build result with creator first
  const roles = Object.keys(byRole)
  const creatorRole = roles.find((r) => r.toLowerCase() === 'creator')
  const otherRoles = roles.filter((r) => r.toLowerCase() !== 'creator').sort()

  return [creatorRole, ...otherRoles].filter(Boolean).map((role) => ({
    role: role!,
    members: byRole[role!].sort(sortMembers)
  }))
})
</script>

<template>
  <div v-if="server_store.hasServerMembers" class="p-2">
    <div v-if="!grouped.length" class="text-xs text-surface-500 px-2 py-1">
      {{ t('userInterface.membersAside.no_members') }}
    </div>

    <div v-for="group in grouped" :key="group.role" class="mb-3">
      <div class="px-2 py-1 text-xs font-semibold flex items-center gap-1">
        <span
          :class="group.role.toLowerCase() === 'creator' ? 'gradient-text' : 'text-surface-600'"
        >
          {{ group.role }}
        </span>
        <span class="text-2xs text-surface-500">- {{ group.members.length }}</span>
      </div>

      <ul class="flex flex-col gap-1">
        <li
          v-for="m in group.members"
          :key="m.public_id"
          class="px-2 py-1 rounded hover:bg-surface-300"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full overflow-hidden bg-surface-300 flex items-center justify-center text-[10px] font-semibold text-surface-800"
            >
              <img
                v-if="m.avatar_url"
                :src="m.avatar_url"
                :alt="m.nickname"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(m.nickname, { mode: 'all', maxInitials: 2 }) }}</span>
            </div>
            <div class="text-sm text-surface-900">{{ m.nickname }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
