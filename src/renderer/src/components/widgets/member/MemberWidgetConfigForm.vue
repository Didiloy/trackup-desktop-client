<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MemberAutocomplete from '@/components/members/MemberAutocomplete.vue'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'

const props = defineProps<{
    modelValue: Record<string, any>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const selectedMember = ref<IServerMember | null>(null)

function handleSelect(member: IServerMember | null): void {
    selectedMember.value = member
    emit('update:modelValue', {
        ...props.modelValue,
        memberId: member?.public_id
    })
}
</script>

<template>
    <div class="space-y-4">
        <label class="block text-sm font-medium text-surface-700">
            {{ t('widgets.ui.select_member', 'Sélectionner un membre') }}
        </label>
        <MemberAutocomplete
            :model-value="selectedMember?.nickname || ''"
            :placeholder="t('placeholder.search_nickname')"
            @select="handleSelect"
        />
    </div>
</template>
