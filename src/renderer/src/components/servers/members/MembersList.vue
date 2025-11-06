<script setup lang="ts">
import { computed } from 'vue'
import type { IServerMember } from '../../../../../shared/contracts/interfaces/entities/member.interfaces'

interface Props {
  members: IServerMember[]
  loading?: boolean
}

const props = defineProps<Props>()

const grouped = computed(() => {
  const byRole = new Map<string, IServerMember[]>()

  for (const m of props.members) {
    const role = (m.role_name || 'Unknown').trim()
    if (!byRole.has(role)) byRole.set(role, [])
    byRole.get(role)!.push(m)
  }

  const sortKey = (m: IServerMember): string => (m.nickname || m.user_email || '').toLowerCase()

  // Ensure creator group first (case-insensitive match)
  const creatorKey = Array.from(byRole.keys()).find((k) => k.toLowerCase() === 'creator')
  const result: Array<{ role: string; members: IServerMember[] }> = []
  if (creatorKey) {
    const creators = (byRole.get(creatorKey) || [])
      .slice()
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    result.push({ role: creatorKey, members: creators })
    byRole.delete(creatorKey)
  }

  // Other roles sorted alphabetically
  const otherRoles = Array.from(byRole.keys()).sort((a, b) => a.localeCompare(b))
  for (const role of otherRoles) {
    const members = (byRole.get(role) || [])
      .slice()
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    result.push({ role, members })
  }

  return result
})
</script>

<template>
  <div class="p-2">
    <div v-if="loading" class="text-xs text-surface-500 px-2 py-1">
      {{ $t('userInterface.serverSidebar.loading') }}
    </div>
    <template v-else>
      <template v-if="grouped.length">
        <div v-for="group in grouped" :key="group.role" class="mb-3">
          <div class="px-2 py-1 text-xs font-semibold flex items-center gap-1">
            <span
              :class="
                (group.role || '').toLowerCase() === 'creator'
                  ? 'gradient-text'
                  : 'text-surface-600'
              "
            >
              {{ group.role }}
            </span>
            <span class="text-2xs text-surface-500">- {{ group.members.length }}</span>
          </div>
          <ul class="flex flex-col gap-1">
            <li
              v-for="m in group.members"
              :key="m.public_id"
              class="px-2 py-1 rounded hover:bg-surface-200"
            >
              <div class="text-sm text-surface-900">{{ m.nickname || m.user_email }}</div>
            </li>
          </ul>
        </div>
      </template>
      <div v-else class="text-xs text-surface-500 px-2 py-1">
        {{ $t('userInterface.serverSidebar.no_members') }}
      </div>
    </template>
  </div>
</template>
