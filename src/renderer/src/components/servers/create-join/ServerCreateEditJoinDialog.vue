<script setup lang="ts">
import { ref } from 'vue'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import CreateEditServerForm from '@/components/servers/create-join/CreateEditServerForm.vue'
import JoinServerForm from '@/components/servers/create-join/JoinServerForm.vue'
import type { IServer } from '@shared/contracts/interfaces/entities/server.interfaces'
import { useI18n } from 'vue-i18n'

interface Props {
    modelValue: boolean
    mode?: 'create' | 'edit'
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'server-action', server: IServer): void
}

const props = withDefaults(defineProps<Props>(), {
    mode: 'create'
})
const emit = defineEmits<Emits>()
const { t } = useI18n()

type ActionType = 'choice' | 'create' | 'join'
const current_action = ref<ActionType>(props.mode === 'edit' ? 'create' : 'choice')

function selectAction(action: 'create' | 'join'): void {
    current_action.value = action
}

function handleServerAction(server: IServer | undefined): void {
    if (!server) return
    emit('server-action', server)
    closeDialog()
}

function handleCancel(): void {
    if (current_action.value !== 'choice' && props.mode !== 'edit') {
        current_action.value = 'choice'
    } else {
        closeDialog()
    }
}

function handleDialogClose(value: boolean): void {
    current_action.value = props.mode === 'edit' ? 'create' : 'choice'
    emit('update:modelValue', value)
}

function closeDialog(): void {
    current_action.value = props.mode === 'edit' ? 'create' : 'choice'
    emit('update:modelValue', false)
}
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        :style-class="'w-[560px] max-w-[92vw] rounded-xl select-none'"
        :content-class="'p-0 bg-surface-50'"
        @update:model-value="handleDialogClose"
    >
        <template #header>
            <div class="flex items-center gap-2 p-3">
                <i class="pi pi-plus-circle text-primary-500"></i>
                <span class="font-semibold text-surface-900">
                    {{
                        current_action === 'create'
                            ? props.mode === 'edit'
                                ? t('views.edit_server.title')
                                : t('views.create_server.title')
                            : current_action === 'join'
                              ? t('views.join_server.title')
                              : t('views.create_server.action.title')
                    }}
                    <br />
                    <!--           add edit subtitile     <-->
                    <span class="text-sm text-surface-500">
                        {{
                            current_action === 'create'
                                ? props.mode === 'edit'
                                    ? t('views.edit_server.subtitle')
                                    : t('views.create_server.subtitle')
                                : ''
                        }}
                    </span>
                </span>
            </div>
        </template>

        <div class="p-4">
            <!-- Choice view -->
            <div v-if="current_action === 'choice'" class="flex flex-col gap-3">
                <p class="text-sm text-surface-600 mb-2">
                    {{ t('views.create_server.action.description') }}
                </p>

                <Button
                    :label="t('views.create_server.title')"
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
                        <span class="font-semibold">{{ t('views.create_server.title') }}</span>
                        <span class="text-xs text-surface-500">{{
                            t('views.create_server.subtitle')
                        }}</span>
                    </div>
                </Button>

                <Button
                    :label="t('views.join_server.title')"
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
                        <span class="font-semibold">{{ t('views.join_server.title') }}</span>
                        <span class="text-xs text-surface-500">{{
                            t('views.join_server.subtitle')
                        }}</span>
                    </div>
                </Button>
            </div>

            <!-- Create/Edit server form -->
            <CreateEditServerForm
                v-else-if="current_action === 'create'"
                :mode="props.mode"
                @saved="handleServerAction"
                @cancel="handleCancel"
            />

            <!-- Join server form -->
            <JoinServerForm
                v-else-if="current_action === 'join'"
                @joined="handleServerAction"
                @cancel="handleCancel"
            />
        </div>
    </AppDialog>
</template>
