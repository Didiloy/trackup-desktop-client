<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberSearch } from '@/composables/members/useMemberSearch'
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { getInitials } from '@/utils'

interface Props {
    modelValue?: string
    placeholder?: string
    initialMember?: IServerMember | null
    disabled?: boolean
    size?: 'small' | 'large' | ''
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'select', member: IServerMember | null): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    initialMember: null,
    disabled: false,
    size: ''
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const { memberQuery, memberSuggestions, searchMembers, onMemberQueryChange } = useMemberSearch()

// Sync prop to internal ref
watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal !== memberQuery.value) {
            memberQuery.value = newVal || ''
        }
    },
    { immediate: true }
)

// Sync internal ref to emit
watch(memberQuery, (newVal) => {
    emit('update:modelValue', newVal || '')
    if (!newVal) {
        emit('select', null)
    }
})

function handleItemSelect(event: { value: IServerMember }): void {
    onMemberQueryChange(event.value.nickname || '')
    emit('select', event.value)
}

function handleComplete(event: { query: string }): void {
    searchMembers(event.query)
}

// Handle initial member
onMounted(() => {
    if (props.initialMember) {
        memberQuery.value = props.initialMember.nickname || ''
        memberSuggestions.value = [props.initialMember]
        onMemberQueryChange(props.initialMember.nickname || '')
    }
})
</script>

<template>
    <AutoComplete
        v-model="memberQuery"
        :suggestions="memberSuggestions"
        option-label="nickname"
        :placeholder="placeholder || t('placeholder.search_nickname')"
        :size="size"
        :disabled="disabled"
        :pt="{
            root: { style: 'width: 100%;' }
        }"
        @complete="handleComplete"
        @item-select="handleItemSelect"
    >
        <template #option="slotProps">
            <div class="flex items-center gap-2">
                <img
                    v-if="slotProps.option.avatar_url"
                    :src="slotProps.option.avatar_url"
                    class="w-6 h-6 rounded-full object-cover"
                    alt="Avatar"
                />
                <div
                    v-else
                    class="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-xs font-semibold text-primary-800"
                >
                    {{ getInitials(slotProps.option.nickname, { mode: 'all', maxInitials: 2 }) }}
                </div>
                <span>{{ slotProps.option.nickname }}</span>
            </div>
        </template>
    </AutoComplete>
</template>

<style scoped>
:deep(.p-autocomplete) {
    width: 100% !important;
}

:deep(.p-autocomplete-input-wrapper) {
    width: 100% !important;
}

:deep(.p-inputtext) {
    width: 100% !important;
}

:deep(.p-autocomplete-panel) {
    width: 100% !important;
}
</style>
