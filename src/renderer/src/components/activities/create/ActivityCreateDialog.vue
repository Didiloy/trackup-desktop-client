<script setup lang="ts">
import { ref, computed } from 'vue'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import type {
    IActivity,
    ICreateActivityRequest
} from '../../../../../shared/contracts/interfaces/entities/activity.interfaces'

interface Props {
    modelValue: boolean
}
interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'created', activity: IActivity): void
}
defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { createActivity } = useActivityCRUD()

const name = ref('')
const description = ref('')
const logo = ref<string>('')
const banner = ref<string>('')
const submitting = ref(false)
const error = ref<string | null>(null)

const can_submit = computed(() => !submitting.value && !!name.value.trim())

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}
function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

function close(): void {
    emit('update:modelValue', false)
}

async function submit(): Promise<void> {
    if (!can_submit.value) return
    submitting.value = true
    error.value = null
    try {
        const serverId = (route.params.id as string) || ''
        const payload: ICreateActivityRequest = {
            name: name.value.trim(),
            description: description.value.trim(),
            logo: logo.value,
            banner: banner.value
        }
        const res = await createActivity(serverId, payload)
        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to create activity')
        }
        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
        emit('created', res.data)
        close()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create activity'
    } finally {
        submitting.value = false
    }
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2'"
        :content-class="'p-0 bg-surface-50'"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <i class="pi pi-plus-circle text-primary-500"></i>
                <div class="flex flex-col">
                    <span class="font-semibold text-surface-900">{{
                        t('userInterface.serverActivitiesView.addActivityModal.title')
                    }}</span>
                    <span class="text-xs text-surface-600">
                        {{ t('userInterface.serverActivitiesView.addActivityModal.description') }}
                    </span>
                </div>
            </div>
        </template>

        <div class="p-4 flex flex-col gap-5">
            <!-- General information -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <i class="pi pi-file-edit text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{ t('common.name') }}</span>
                </div>
                <InputText
                    v-model="name"
                    :placeholder="t('userInterface.serverActivitiesView.addActivityModal.name')"
                    class="w-full"
                    :pt="{ root: { style: background_style } }"
                />
                <div class="flex items-center gap-2">
                    <i class="pi pi-pen-to-square text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{
                        t('common.description')
                    }}</span>
                </div>
                <Textarea
                    v-model="description"
                    rows="3"
                    auto-resize
                    :placeholder="
                        t('userInterface.serverActivitiesView.addActivityModal.description_input')
                    "
                    :pt="{ root: { style: background_style } }"
                />
            </div>

            <!-- Media -->
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <i class="pi pi-image text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{ t('common.logo') }}</span>
                </div>
                <EntityLogoHandling
                    :logo="logo"
                    :initial="name"
                    :entity-name="name"
                    :display-edit-button="true"
                    @update-logo="updateLogo"
                />
                <div class="flex items-center gap-2">
                    <i class="pi pi-images text-surface-500"></i>
                    <span class="text-sm font-medium text-surface-700">{{
                        t('common.banner')
                    }}</span>
                </div>
                <EntityBannerHandling
                    :banner="banner"
                    :display-edit-button="true"
                    @update-banner="updateBanner"
                />
            </div>

            <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2 p-3">
                <Button :label="t('common.cancel')" severity="secondary" text @click="close" />
                <Button
                    :label="t('userInterface.serverActivitiesView.addActivityModal.createButton')"
                    :loading="submitting"
                    :disabled="!can_submit"
                    :style="{ background: 'var(--gradient-primary)' }"
                    @click="submit"
                />
            </div>
        </template>
    </AppDialog>
</template>
