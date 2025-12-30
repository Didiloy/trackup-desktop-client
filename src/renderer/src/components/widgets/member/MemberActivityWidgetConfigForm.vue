<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MemberAutocomplete from '@/components/members/MemberAutocomplete.vue'
import ActivityAutocomplete from '@/components/activities/ActivityAutocomplete.vue'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const selectedMember = ref<IServerMember | null>(null)
const selectedActivity = ref<IActivity | null>(null)

function handleMemberSelect(member: IServerMember | null): void {
    selectedMember.value = member
    emit('update:modelValue', {
        ...props.modelValue,
        memberId: member?.public_id
    })
}

function handleActivitySelect(activity: IActivity | null): void {
    selectedActivity.value = activity
    emit('update:modelValue', {
        ...props.modelValue,
        activityId: activity?.public_id
    })
}
</script>

<template>
    <div class="space-y-4">
        <!-- Member Selection -->
        <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">
                {{
                    t('common.actions.select', {
                        entity: t('views.server_members.title_single').toLowerCase()
                    })
                }}
            </label>
            <MemberAutocomplete
                :model-value="selectedMember?.nickname || ''"
                @select="handleMemberSelect"
            />
        </div>

        <!-- Activity Selection -->
        <div>
            <label class="block text-sm font-medium text-surface-700 mb-2">
                {{
                    t('common.actions.select', {
                        entity: t('views.activity.title_single').toLowerCase()
                    })
                }}
            </label>
            <ActivityAutocomplete
                :model-value="selectedActivity?.name || ''"
                @select="handleActivitySelect"
            />
        </div>
    </div>
</template>
