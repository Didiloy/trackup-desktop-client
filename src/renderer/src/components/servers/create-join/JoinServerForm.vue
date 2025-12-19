<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
    IJoinServerRequest,
    IServer
} from '@shared/contracts/interfaces/entities/server.interfaces'
import { useI18n } from 'vue-i18n'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'

const { t } = useI18n()

const emit = defineEmits<{
    (e: 'joined', server: IServer): void
    (e: 'cancel'): void
}>()

const invitation_code = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const { joinServer } = useServerCRUD()

const can_submit = computed(() => {
    return !submitting.value && !!invitation_code.value.trim()
})

async function submit(): Promise<void> {
    if (!can_submit.value) return
    submitting.value = true

    const payload: IJoinServerRequest = {
        code: invitation_code.value.trim()
    }

    const res = await joinServer(payload)
    if (res.error) {
        error.value = t('messages.error.joinServerFailed')
        submitting.value = false
        return
    } else {
        emit('joined', res.data!)
    }
}
</script>

<template>
    <div class="flex flex-col gap-4 select-none">
        <div class="flex flex-col gap-2">
            <label class="text-sm text-surface-500">
                {{ t('views.join_server.invitation_code_label') }}
            </label>
            <InputText
                v-model="invitation_code"
                :placeholder="t('views.join_server.placeholder.invitation_code')"
                class="w-full"
            />
            <small class="text-xs text-surface-500">
                {{ t('views.join_server.invitation_code_hint') }}
            </small>
        </div>

        <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

        <div class="flex justify-end gap-2 pt-2">
            <Button
                :label="t('common.actions.cancel')"
                severity="secondary"
                text
                @click="emit('cancel')"
            />
            <Button
                :label="t('views.join_server.join_button')"
                :loading="submitting"
                :disabled="!can_submit"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="submit"
            />
        </div>
    </div>
</template>
