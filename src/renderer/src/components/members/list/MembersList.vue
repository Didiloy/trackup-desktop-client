<script setup lang="ts">
import { computed } from 'vue'
import { useServerStore } from '@/stores/server'
import { useI18n } from 'vue-i18n'
import MembersListItems from './MembersListItems.vue'

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
            {{ t('views.members_aside.no_members') }}
        </div>

        <div v-for="group in grouped" :key="group.role" class="mb-3">
            <div class="px-2 py-1 text-xs font-semibold flex items-center gap-1">
                <span
                    :class="
                        group.role.toLowerCase() === 'creator'
                            ? 'gradient-text'
                            : 'text-surface-600'
                    "
                >
                    {{
                        group.role.toLowerCase() === 'creator'
                            ? t('common.fields.creator')
                            : group.role
                    }}
                </span>
                <span class="text-2xs text-surface-500">- {{ group.members.length }}</span>
            </div>

            <MembersListItems v-for="m in group.members" :key="m.public_id" :member="m" />
        </div>
    </div>
</template>
