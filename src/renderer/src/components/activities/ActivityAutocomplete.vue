<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivitySearch } from '@/composables/activities/useActivitySearch'
import type { IActivity } from '@shared/contracts/interfaces/entities/activity.interfaces'

interface Props {
    modelValue?: string
    placeholder?: string
    initialActivity?: IActivity | null
    disabled?: boolean
    size?: 'small' | 'large' | ''
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'select', activity: IActivity | null): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    initialActivity: null,
    disabled: false,
    size: ''
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const { activityQuery, activitySuggestions, searchActivities, onActivityQueryChange } =
    useActivitySearch()

// Sync prop to internal ref
watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal !== activityQuery.value) {
            activityQuery.value = newVal || ''
        }
    },
    { immediate: true }
)

// Sync internal ref to emit
watch(activityQuery, (newVal) => {
    emit('update:modelValue', newVal || '')
    // If cleared, emit null select
    if (!newVal) {
        emit('select', null)
    }
})

function handleItemSelect(event: { value: IActivity }): void {
    onActivityQueryChange(event.value.name)
    emit('select', event.value)
}

function handleComplete(event: { query: string }): void {
    searchActivities(event.query)
}

// Handle initial activity
onMounted(() => {
    if (props.initialActivity) {
        activityQuery.value = props.initialActivity.name
        activitySuggestions.value = [props.initialActivity]
        onActivityQueryChange(props.initialActivity.name)
    }
})

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
    <AutoComplete
        v-model="activityQuery"
        :suggestions="activitySuggestions"
        option-label="name"
        :placeholder="
            placeholder ||
            t('userInterface.serverSessionsView.addSessionModal.searchActivityPlaceholder')
        "
        class="w-full"
        :size="size"
        :disabled="disabled"
        :pt="{
            input: { class: 'bg-surface-100', style: background_style },
            overlay: { class: 'bg-surface-100', style: background_style }
        }"
        @complete="handleComplete"
        @item-select="handleItemSelect"
    >
        <template #option="slotProps">
            <div class="flex items-center gap-2">
                <img
                    v-if="slotProps.option.logo"
                    :src="slotProps.option.logo"
                    class="w-6 h-6 rounded object-cover"
                    alt="logo"
                />
                <div
                    v-else
                    class="w-6 h-6 rounded bg-surface-200 flex items-center justify-center text-xs"
                >
                    {{ slotProps.option.name.charAt(0).toUpperCase() }}
                </div>
                <span>{{ slotProps.option.name }}</span>
            </div>
        </template>
    </AutoComplete>
</template>
