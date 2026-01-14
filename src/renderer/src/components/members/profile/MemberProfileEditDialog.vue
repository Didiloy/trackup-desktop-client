<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import type {
    IServerMember,
    IUpdateMemberProfileDto
} from '@shared/contracts/interfaces/entities/member.interfaces'

const { t } = useI18n()

interface Props {
    modelValue: boolean
    serverMember: IServerMember
    /** Function prop for async confirmation - manages loading state internally */
    onConfirm?: (data: IUpdateMemberProfileDto) => void | Promise<void>
}

const props = defineProps<Props>()

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

const hasChanges = computed(() => {
    return (
        nicknameInput.value !== props.serverMember.nickname ||
        avatarUrlInput.value !== props.serverMember.avatar_url
    )
})

const isFormValid = computed(() => {
    return nicknameInput.value.trim() !== '' && hasChanges.value
})

// Reset form when dialog is opened
watch(visible, (newVal) => {
    if (newVal) {
        nicknameInput.value = props.serverMember.nickname
        avatarUrlInput.value = props.serverMember.avatar_url
        loading.value = false
    }
})

const closeDialog = (): void => {
    emit('update:modelValue', false)
}

const handleAvatarUpdate = (newAvatar: string): void => {
    avatarUrlInput.value = newAvatar
}

const confirmAction = async (): Promise<void> => {
    if (!isFormValid.value || loading.value) return

    if (props.onConfirm) {
        loading.value = true
        try {
            const data: IUpdateMemberProfileDto = {}

            // Only include changed fields
            if (nicknameInput.value !== props.serverMember.nickname) {
                data.nickname = nicknameInput.value.trim()
            }
            if (avatarUrlInput.value !== props.serverMember.avatar_url) {
                data.avatar_url = avatarUrlInput.value.trim() || undefined
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
    <AppDialog
        v-model="visible"
        style-class="w-[600px] max-w-[92vw]"
        content-class="p-6 bg-surface-50"
    >
        <template #header>
            <div class="flex items-center gap-2 p-3">
                <i class="pi pi-user-edit text-primary-600"></i>
                <div class="flex flex-col">
                    <span class="font-semibold text-surface-900">
                        {{ t('views.members_aside.update_profile') }}
                    </span>
                    <span class="text-xs text-surface-600">
                        {{ t('views.members_aside.update_profile_message') }}
                    </span>
                </div>
            </div>
        </template>

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

            <!-- Avatar Handling -->
            <div class="field">
                <label class="text-sm font-medium mb-2 block">
                    {{ t('views.members_aside.avatar_url') }}
                </label>
                <div class="p-4 rounded-2xl bg-surface-100 ring-1 ring-surface-200">
                    <EntityLogoHandling
                        :logo="avatarUrlInput"
                        :entity-name="nicknameInput || serverMember.nickname"
                        :display-edit-button="true"
                        @update-logo="handleAvatarUpdate"
                    />
                </div>
            </div>
        </div>

        <template #footer>
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
        </template>
    </AppDialog>
</template>

<style scoped>
.dialog-buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
}

.form-container {
    user-select: text;
}

.field {
    margin-bottom: 1.5rem;
}

.field:last-child {
    margin-bottom: 0;
}

.w-full {
    width: 100%;
}
</style>
