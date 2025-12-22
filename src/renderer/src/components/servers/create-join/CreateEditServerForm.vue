<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type {
    IServer,
    IServerApiResponse
} from '@shared/contracts/interfaces/entities/server.interfaces'
import type { IServerType } from '@shared/contracts/interfaces/entities/server-type.interfaces'
import { useI18n } from 'vue-i18n'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import { useServerTypeCRUD } from '@/composables/servers/useServerTypeCRUD'
import { useServerStore } from '@/stores/server'

const { t } = useI18n()

const props = withDefaults(
    defineProps<{
        mode?: 'create' | 'edit'
    }>(),
    {
        mode: 'create'
    }
)

const emit = defineEmits<{
    (e: 'saved', server: IServer | undefined): void
    (e: 'cancel'): void
}>()

const server_store = useServerStore()
const isEditMode = computed(() => props.mode === 'edit')

const name = ref('')
const description = ref('')
const selected_type = ref<IServerType | null>(null)
const server_types = ref<IServerType[]>([])
const logo = ref<string>('')
const banner = ref<string>('')

const submitting = ref(false)
const loading_types = ref(false)
const error = ref<string | null>(null)
const { createServer, updateServer } = useServerCRUD()
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

function initializeFormForEdit(): void {
    if (!isEditMode.value) return

    name.value = server_store.getName ?? ''
    description.value = server_store.getDescription ?? ''
    logo.value = server_store.getLogo ?? ''
    banner.value = server_store.getBanner ?? ''

    // Find and set the server type
    const typeId = server_store.getServerTypePublicId
    if (typeId && server_types.value.length > 0) {
        selected_type.value =
            server_types.value.find((st) => st.public_id === typeId) ?? null
    }
}

function updateLogo(newLogo: string): void {
    logo.value = newLogo
}

function updateBanner(newBanner: string): void {
    banner.value = newBanner
}

async function submitForm(): Promise<void> {
    if (!can_submit.value) return
    submitting.value = true
    error.value = null

    const payload = {
        name: name.value.trim(),
        type_public_id: selected_type.value!.public_id,
        description: description.value.trim(),
        logo: logo.value,
        banner: banner.value
    }

    let res: IServerApiResponse<IServer>

    if (isEditMode.value) {
        const serverId = server_store.getPublicId
        if (!serverId) {
            error.value = t('messages.error.general')
            submitting.value = false
            return
        }
        res = await updateServer(serverId, payload)
    } else {
        res = await createServer(payload)
    }

    if (res.error) {
        error.value = res.error
        submitting.value = false
        return
    }

    emit('saved', res.data)
    submitting.value = false
}

onMounted(async () => {
    await loadServerTypes()
    if (isEditMode.value) {
        initializeFormForEdit()
    }
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
                :disabled="isEditMode"
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
                :label="isEditMode ? t('common.actions.save') : t('common.actions.create')"
                :loading="submitting"
                :disabled="!can_submit"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="submitForm"
            />
        </div>
    </div>
</template>
