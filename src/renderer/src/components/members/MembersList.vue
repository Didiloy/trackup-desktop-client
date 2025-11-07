<script setup lang="ts">
import { computed, ref } from 'vue'
import { useServerStore } from '@/stores/server'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { getInitials } from '@/utils'
import ContextActionMenu from '@/components/common/ContextActionMenu.vue'
import InputDialog from '@/components/common/dialogs/InputDialog.vue'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMemberCRUD } from '@/composables/members/useMemberCRUD'
import { IServerMember } from '../../../../shared/contracts/interfaces/entities/member.interfaces'

const server_store = useServerStore()
const user_store = useUserStore()
const { t } = useI18n()
const { updateMemberNickname } = useMemberCRUD()

const currentMember = ref<IServerMember>()
const showNicknameDialog = ref(false)
const newNickname = ref('')
const isUpdating = ref(false)

const openNicknameDialog = (): void => {
  if (!currentMember.value) return
  newNickname.value = currentMember.value.nickname || ''
  showNicknameDialog.value = true
}

const closeNicknameDialog = (): void => {
  showNicknameDialog.value = false
  newNickname.value = ''
  isUpdating.value = false
}

const handleUpdateNickname = async (nickname: string): Promise<void> => {
  if (!currentMember.value?.public_id || !server_store.getPublicId) return
  if (!nickname || nickname === currentMember.value?.nickname) {
    closeNicknameDialog()
    return
  }

  isUpdating.value = true

  try {
    const result = await updateMemberNickname(
      server_store.getPublicId,
      currentMember.value.public_id,
      { nickname }
    )

    if (result.data) {
      // Refresh the members list by fetching again
      const { listMembers } = useMemberCRUD()
      const membersResult = await listMembers(server_store.getPublicId)
      if (membersResult.data) {
        server_store.setMembers(membersResult.data.data)
      }
      closeNicknameDialog()
    } else {
      console.error('Failed to update nickname:', result.error)
      // Keep dialog open to show error
      isUpdating.value = false
    }
  } catch (error) {
    console.error('Error updating nickname:', error)
    isUpdating.value = false
  }
}

const items = computed(() => {
  const baseItems = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => {
        console.log('View profile for', currentMember.value?.nickname)
      }
    }
  ]

  // Only add Update Nickname option if the current member is the logged-in user
  if (currentMember.value?.user_email === user_store.getEmail) {
    baseItems.push({
      label: 'Update Nickname',
      icon: 'pi pi-user-edit',
      command: openNicknameDialog
    })
  }

  return baseItems
})

const { menu, onRightClick } = useContextMenu(items.value)

const handleRightClick = (event: MouseEvent, member: IServerMember): void => {
  currentMember.value = member
  onRightClick(event)
}

const onItemSelected = (item: unknown): void => {
  const menuItem = item as { command?: () => void }
  menuItem.command?.()
}

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
          @contextmenu="handleRightClick($event, m)"
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

  <ContextActionMenu ref="menu" :items="items" @item-selected="onItemSelected" />

  <!-- Nickname Update Dialog -->
  <InputDialog
    v-model="showNicknameDialog"
    v-model:input-value="newNickname"
    :title="t('userInterface.membersAside.update_nickname')"
    :message="t('userInterface.membersAside.update_nickname_message')"
    :input-label="t('userInterface.membersAside.new_nickname')"
    :input-placeholder="t('userInterface.membersAside.enter_nickname')"
    :confirm-label="t('actions.update')"
    :cancel-label="t('actions.cancel')"
    confirm-severity="primary"
    :loading="isUpdating"
    @confirm="handleUpdateNickname"
  />
</template>
