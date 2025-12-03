<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'
import { useServerStore } from '@/stores/server'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import type {
    IActivity,
    ICreateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{}>()

const emit = defineEmits<{
    (e: 'success', activity: IActivity): void
    (e: 'cancel'): void
}>()

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { createActivity } = useActivityCRUD()

const name = ref('')
const description = ref('')
const logo = ref<string>('')
const banner = ref<string>('')
const submitting = ref(false)

const can_submit = computed(() => {
    return !submitting.value && !!name.value.trim()
})

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}
function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

async function onCreate(): Promise<void> {
    if (!can_submit.value) return

    submitting.value = true

    try {
        const serverId = server_store.getPublicId
        if (!serverId) {
            throw new Error(t('messages.error.noServerSelected'))
        }

        const payload: ICreateActivityRequest = {
            name: name.value.trim(),
            description: description.value.trim(),
            logo: logo.value,
            banner: banner.value
        }

        const res = await createActivity(serverId, payload)
        if (res.error || !res.data) {
            throw new Error(res.error || t('messages.error.create'))
        }

        toast.add({ severity: 'success', summary: t('messages.success.create'), life: 2500 })
        emit('success', res.data)
    } catch (e) {
        const message = e instanceof Error ? e.message : t('messages.error.create')
        toast.add({ severity: 'error', summary: message, life: 3000 })
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-5 h-full">
        <!-- General information -->
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <i class="pi pi-file-edit text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700"
                    >{{ t('common.fields.name') }} <span class="text-red-500">*</span></span
                >
            </div>
            <InputText
                v-model="name"
                :placeholder="t('views.activity.add_modal.name')"
                class="w-full"
            />
            <div class="flex items-center gap-2">
                <i class="pi pi-pen-to-square text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">{{
                    t('common.fields.description')
                }}</span>
            </div>
            <Textarea
                v-model="description"
                rows="3"
                auto-resize
                :placeholder="t('views.activity.add_modal.description_input')"
            />
        </div>

        <!-- Media -->
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <i class="pi pi-image text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">{{
                    t('common.fields.logo')
                }}</span>
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
                    t('common.fields.banner')
                }}</span>
            </div>
            <EntityBannerHandling
                :banner="banner"
                :display-edit-button="true"
                @update-banner="updateBanner"
            />
        </div>

        <div class="flex justify-end gap-2">
            <Button
                :label="t('common.actions.cancel')"
                severity="secondary"
                text
                @click="emit('cancel')"
            />
            <Button
                :label="t('common.actions.create')"
                :disabled="!can_submit"
                :loading="submitting"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onCreate"
            />
        </div>
    </div>
</template>
