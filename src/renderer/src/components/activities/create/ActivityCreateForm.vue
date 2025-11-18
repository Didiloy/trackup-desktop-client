<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import type { ICreateActivityRequest } from '@shared/contracts/interfaces/entities/activity.interfaces'

const emit = defineEmits<{
    (e: 'next', payload: ICreateActivityRequest): void
    (e: 'cancel'): void
}>()

const { t } = useI18n()

const name = ref('')
const description = ref('')
const logo = ref<string>('')
const banner = ref<string>('')

const submitting = ref(false)
const can_submit = computed(() => !submitting.value && !!name.value.trim())

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}
function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

function onNext(): void {
    if (!can_submit.value) return
    const payload: ICreateActivityRequest = {
        name: name.value.trim(),
        description: description.value.trim(),
        logo: logo.value,
        banner: banner.value
    }
    emit('next', payload)
}

const background_style = 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
</script>

<template>
    <div class="flex flex-col gap-5 h-full">
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
                <span class="text-sm font-medium text-surface-700">{{ t('common.banner') }}</span>
            </div>
            <EntityBannerHandling
                :banner="banner"
                :display-edit-button="true"
                @update-banner="updateBanner"
            />
        </div>

        <div class="flex justify-end gap-2 pt-2 mt-auto">
            <Button :label="t('common.cancel')" severity="secondary" text @click="emit('cancel')" />
            <Button
                :label="t('common.next')"
                :disabled="!can_submit"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onNext"
            />
        </div>
    </div>
</template>
