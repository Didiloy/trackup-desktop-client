<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import type {
    IActivity,
    IUpdateActivityRequest
} from '@shared/contracts/interfaces/entities/activity.interfaces'

const props = defineProps<{
    activity: IActivity
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update', payload: IUpdateActivityRequest): void
    (e: 'next'): void
}>()

const { t } = useI18n()

const name = ref('')
const description = ref('')
const logo = ref<string>('')
const banner = ref<string>('')

onMounted(() => {
    name.value = props.activity.name
    description.value = props.activity.description || ''
    logo.value = props.activity.logo || ''
    banner.value = props.activity.banner || ''
})

const can_submit = computed(() => {
    return !props.loading && !!name.value.trim()
})

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}
function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

function onUpdate(): void {
    if (!can_submit.value) return
    const payload: IUpdateActivityRequest = {
        name: name.value.trim(),
        description: description.value.trim(),
        logo: logo.value,
        banner: banner.value
    }
    emit('update', payload)
}
</script>

<template>
    <div class="flex flex-col gap-5 h-full">
        <!-- General information -->
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <i class="pi pi-file-edit text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">
                    {{ t('common.fields.name') }} <span class="text-red-500">*</span>
                </span>
            </div>
            <InputText
                v-model="name"
                :placeholder="t('views.activity.add_modal.name')"
                class="w-full"
                disabled
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

        <div class="flex justify-end gap-2 pt-2 mt-auto">
            <Button
                :label="t('common.actions.next')"
                severity="secondary"
                text
                @click="emit('next')"
            />
            <Button
                :label="t('common.actions.save')"
                :disabled="!can_submit"
                :loading="props.loading"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="onUpdate"
            />
        </div>
    </div>
</template>
