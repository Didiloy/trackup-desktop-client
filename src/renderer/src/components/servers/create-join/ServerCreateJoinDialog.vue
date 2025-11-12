<script setup lang="ts">
import { ref } from 'vue'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import CreateServerForm from '@/components/servers/create-join/CreateServerForm.vue'
import JoinServerForm from '@/components/servers/create-join/JoinServerForm.vue'
import type { IServer } from '../../../../../shared/contracts/interfaces/entities/server.interfaces'
import { useI18n } from 'vue-i18n'

interface Props {
    modelValue: boolean
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'server-action', server: IServer): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

type ActionType = 'choice' | 'create' | 'join'
const currentAction = ref<ActionType>('choice')

function selectAction(action: 'create' | 'join'): void {
    currentAction.value = action
}

function handleServerAction(server: IServer | undefined): void {
    if (!server) return
    emit('server-action', server)
    closeDialog()
}

function handleCancel(): void {
    if (currentAction.value !== 'choice') {
        currentAction.value = 'choice'
    } else {
        closeDialog()
    }
}

function closeDialog(): void {
    currentAction.value = 'choice'
    emit('update:modelValue', false)
}
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        :style-class="'w-[560px] max-w-[92vw] rounded-xl select-none'"
        :content-class="'p-0 bg-surface-50'"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #header>
            <div class="flex items-center gap-2 p-3">
                <i class="pi pi-plus-circle text-primary-500"></i>
                <span class="font-semibold text-surface-900">
                    {{
                        currentAction === 'create'
                            ? t('userInterface.createServerView.title')
                            : currentAction === 'join'
                              ? t('userInterface.joinServerView.title')
                              : t('userInterface.serverActionView.title')
                    }}
                </span>
            </div>
        </template>

        <div class="p-4">
            <!-- Choice view -->
            <div v-if="currentAction === 'choice'" class="flex flex-col gap-3">
                <p class="text-sm text-surface-600 mb-2">
                    {{ t('userInterface.serverActionView.description') }}
                </p>

                <Button
                    :label="t('userInterface.createServerView.title')"
                    icon="pi pi-plus"
                    class="w-full justify-start"
                    :pt="{
                        root: {
                            class: 'h-14',
                            style: 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
                        }
                    }"
                    @click="selectAction('create')"
                >
                    <template #icon>
                        <i class="pi pi-plus mr-2"></i>
                    </template>
                    <div class="flex flex-col">
                        <span class="font-semibold">{{
                            t('userInterface.createServerView.title')
                        }}</span>
                        <span class="text-xs text-surface-500">{{
                            t('userInterface.createServerView.subtitle')
                        }}</span>
                    </div>
                </Button>

                <Button
                    :label="t('userInterface.joinServerView.title')"
                    icon="pi pi-sign-in"
                    class="w-full justify-start"
                    :pt="{
                        root: {
                            class: 'h-14',
                            style: 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
                        }
                    }"
                    @click="selectAction('join')"
                >
                    <template #icon>
                        <i class="pi pi-sign-in mr-2"></i>
                    </template>
                    <div class="flex flex-col">
                        <span class="font-semibold">{{
                            t('userInterface.joinServerView.title')
                        }}</span>
                        <span class="text-xs text-surface-500">{{
                            t('userInterface.joinServerView.subtitle')
                        }}</span>
                    </div>
                </Button>
            </div>

            <!-- Create server form -->
            <CreateServerForm
                v-else-if="currentAction === 'create'"
                @created="handleServerAction"
                @cancel="handleCancel"
            />

            <!-- Join server form -->
            <JoinServerForm
                v-else-if="currentAction === 'join'"
                @joined="handleServerAction"
                @cancel="handleCancel"
            />
        </div>
    </AppDialog>
</template>
