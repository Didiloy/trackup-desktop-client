<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type {
    IServer,
    ICreateServerRequest
} from '@shared/contracts/interfaces/entities/server.interfaces'
import type { IServerType } from '@shared/contracts/interfaces/entities/server-type.interfaces'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useServerTypeCRUD } from '@/composables/servers/useServerTypeCRUD'

const { t } = useI18n()

const emit = defineEmits<{
    (e: 'created', server: IServer | undefined): void
    (e: 'cancel'): void
}>()

const name = ref('')
const description = ref('')
const selected_type = ref<IServerType | null>(null)
const server_types = ref<IServerType[]>([])
const logo = ref<string>('')
const banner = ref<string>('')

const submitting = ref(false)
const loading_types = ref(false)
const error = ref<string | null>(null)
const { createServer } = useServerCRUD()
const { getAllServerTypes } = useServerTypeCRUD()

const can_submit = computed(() => {
    return !submitting.value && !!name.value.trim() && !!selected_type.value
})

async function loadServerTypes(): Promise<void> {
    loading_types.value = true
    const res = await getAllServerTypes()
    if (res.error) {
        error.value = t('messages.error.fetch')
        loading_types.value = false
        return
    }
    const data = res.data ?? []
    server_types.value = data.map((st) => ({
        ...st,
        label: t(`views.create_server.types.${st.name}`)
    }))
    loading_types.value = false
}

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}

function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

async function createNewServer(): Promise<void> {
    if (!can_submit.value) return
    submitting.value = true
    error.value = null
    const payload: ICreateServerRequest = {
        name: name.value.trim(),
        type_public_id: selected_type.value!.public_id,
        description: description.value.trim(),
        logo: logo.value,
        banner: banner.value
    }
    const res = await createServer(payload)
    if (res.error) {
        error.value = res.error
        submitting.value = false
        return
    }
    const created: IServer | undefined = res.data
    emit('created', created)
    submitting.value = false
}

onMounted(async () => {
    await loadServerTypes()
})
</script>

<template>
    <div class="flex flex-col gap-3 select-none">
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-file-edit text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700"
                    >{{ t('common.fields.name') }} <span class="text-red-500">*</span></span
                >
            </div>
            <InputText
                v-model="name"
                :placeholder="t('views.create_server.placeholder.name')"
                class="w-full"
            />
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-tags text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700"
                    >{{ t('common.fields.type') }} <span class="text-red-500">*</span></span
                >
            </div>
            <Select
                v-model="selected_type"
                :options="server_types"
                option-label="label"
                :loading="loading_types"
                :placeholder="t('views.create_server.placeholder.type')"
                class="w-full"
                append-to="self"
            />
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <i class="pi pi-pen-to-square text-surface-500"></i>
                <span class="text-sm font-medium text-surface-700">{{
                    t('common.fields.description')
                }}</span>
            </div>
            <Textarea
                v-model="description"
                rows="2"
                auto-resize
                :placeholder="t('views.create_server.placeholder.description')"
            />
        </div>

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
        </div>

        <div class="flex flex-col gap-3">
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

        <div v-if="error" class="text-sm text-red-500">{{ error }}</div>

        <div class="flex justify-end gap-2 pt-2">
            <Button
                :label="t('common.actions.cancel')"
                severity="secondary"
                text
                @click="emit('cancel')"
            />
            <Button
                :label="t('common.actions.create')"
                :loading="submitting"
                :disabled="!can_submit"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="createNewServer"
            />
        </div>
    </div>
</template>
