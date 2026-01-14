<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getInitials } from '@/utils'

const { t } = useI18n()

interface Props {
    modelValue: boolean
    nickname?: string
    avatarUrl?: string
    /** Function prop for async confirmation - manages loading state internally */
    onConfirm?: (data: { nickname?: string; avatarUrl?: string }) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
    nickname: '',
    avatarUrl: ''
})

const dialogWidth = '500px'

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        emit('update:modelValue', value)
    }
})

const nicknameInput = ref('')
const avatarUrlInput = ref('')
const loading = ref(false)
const avatarError = ref(false)

const displayInitials = computed(() => {
    if (nicknameInput.value) {
        return getInitials(nicknameInput.value, { mode: 'all', maxInitials: 2 })
    }
    return '?'
})

const hasChanges = computed(() => {
    return nicknameInput.value !== props.nickname || avatarUrlInput.value !== props.avatarUrl
})

const isFormValid = computed(() => {
    return nicknameInput.value.trim() !== '' && hasChanges.value
})

// Reset form when dialog is opened
watch(visible, (newVal) => {
    if (newVal) {
        nicknameInput.value = props.nickname
        avatarUrlInput.value = props.avatarUrl
        loading.value = false
        avatarError.value = false
    }
})

// Validate avatar URL when it changes
watch(avatarUrlInput, () => {
    avatarError.value = false
})

const onAvatarError = (): void => {
    avatarError.value = true
}

const onAvatarLoad = (): void => {
    avatarError.value = false
}

const closeDialog = (): void => {
    emit('update:modelValue', false)
}

const confirmAction = async (): Promise<void> => {
    if (!isFormValid.value || loading.value) return

    if (props.onConfirm) {
        loading.value = true
        try {
            const data: { nickname?: string; avatarUrl?: string } = {}
            
            // Only include changed fields
            if (nicknameInput.value !== props.nickname) {
                data.nickname = nicknameInput.value.trim()
            }
            if (avatarUrlInput.value !== props.avatarUrl) {
                data.avatarUrl = avatarUrlInput.value.trim() || undefined
            }

            await props.onConfirm(data)
            closeDialog()
        } finally {
            loading.value = false
        }
    } else {
        closeDialog()
    }
}
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('views.members_aside.update_profile')"
        :style="{
            width: dialogWidth,
            height: 'fit-content',
            userSelect: 'none'
        }"
        :draggable="false"
        :pt="{
            root: {
                style: 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
            }
        }"
    >
        <p class="mb-4 text-surface-600">{{ t('views.members_aside.update_profile_message') }}</p>

        <div class="form-container">
            <!-- Nickname Field -->
            <div class="field">
                <label for="nickname-input" class="text-sm font-medium mb-2 block">
                    {{ t('views.members_aside.new_nickname') }}
                </label>
                <InputText
                    id="nickname-input"
                    v-model="nicknameInput"
                    :placeholder="t('views.members_aside.enter_nickname')"
                    :disabled="loading"
                    class="w-full"
                    @keyup.enter="confirmAction"
                />
            </div>

            <!-- Avatar URL Field -->
            <div class="field">
                <label for="avatar-input" class="text-sm font-medium mb-2 block">
                    {{ t('views.members_aside.avatar_url') }}
                </label>
                <InputText
                    id="avatar-input"
                    v-model="avatarUrlInput"
                    :placeholder="t('views.members_aside.enter_avatar_url')"
                    :disabled="loading"
                    class="w-full"
                    @keyup.enter="confirmAction"
                />
            </div>

            <!-- Avatar Preview -->
            <div class="field">
                <label class="text-sm font-medium mb-2 block">
                    {{ t('views.members_aside.avatar_preview') }}
                </label>
                <div class="flex items-center gap-4">
                    <div
                        class="w-20 h-20 rounded-xl overflow-hidden bg-primary-100 ring-2 ring-primary-200 shadow-md shrink-0"
                    >
                        <img
                            v-if="avatarUrlInput && !avatarError"
                            :src="avatarUrlInput"
                            class="w-full h-full object-cover"
                            alt="Avatar Preview"
                            @error="onAvatarError"
                            @load="onAvatarLoad"
                        />
                        <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-700"
                        >
                            {{ displayInitials }}
                        </div>
                    </div>
                    <div v-if="avatarError" class="text-sm text-red-600">
                        <i class="pi pi-exclamation-circle mr-1"></i>
                        {{ t('views.members_aside.invalid_url') }}
                    </div>
                </div>
            </div>
        </div>

        <div class="dialog-buttons">
            <Button
                :label="t('common.actions.cancel')"
                severity="secondary"
                :disabled="loading"
                @click="closeDialog"
            />
            <Button
                :label="t('views.members_aside.update_profile')"
                severity="primary"
                :disabled="loading || !isFormValid"
                :loading="loading"
                @click="confirmAction"
            />
        </div>
    </Dialog>
</template>

<style scoped>
.dialog-buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

.form-container {
    margin: 1rem 0;
    user-select: text;
}

.field {
    margin-bottom: 1.25rem;
}

.field:last-child {
    margin-bottom: 0;
}

.w-full {
    width: 100%;
}
</style>
