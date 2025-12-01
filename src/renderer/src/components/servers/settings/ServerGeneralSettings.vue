<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import EntityLogoHandling from '@/components/common/EntityLogoHandling.vue'
import EntityBannerHandling from '@/components/common/EntityBannerHandling.vue'
import { useServerStore } from '@/stores/server'
import { useServerCRUD } from '@/composables/servers/useServerCRUD'
import type { IUpdateServerRequest } from '@shared/contracts/interfaces/entities/server.interfaces'
import { useServerList } from '@/composables/servers/useServerList'

const { t } = useI18n()
const toast = useToast()
const server_store = useServerStore()
const { updateServer } = useServerCRUD()
const { fetchServers: fetchUserServers, error: errorFetchingUserServers } = useServerList()

const name = ref(server_store.getName ?? '')
const description = ref(server_store.getDescription ?? '')
const logo = ref<string>(server_store.getLogo ?? '')
const banner = ref<string>(server_store.getBanner ?? '')
const loading = ref(false)

const has_changes = computed(() => {
    if (!server_store.hasServer) return false
    return (
        name.value.trim() !== server_store.getName ||
        description.value.trim() !== server_store.getDescription ||
        logo.value !== server_store.getLogo ||
        banner.value !== server_store.getBanner
    )
})

const can_submit = computed(() => {
    return !loading.value && has_changes.value && !!name.value.trim()
})

async function handleUpdate(): Promise<void> {
    if (!can_submit.value || !server_store.getPublicId) return

    loading.value = true
    try {
        const payload: IUpdateServerRequest = {
            name: name.value.trim(),
            description: description.value.trim(),
            logo: logo.value,
            banner: banner.value
        }

        const res = await updateServer(server_store.getPublicId, payload)

        if (res.error || !res.data) {
            throw new Error(res.error || 'Failed to update server')
        }

        server_store.setServer(res.data)

        await fetchUserServers()

        if (errorFetchingUserServers.value) {
            throw new Error(errorFetchingUserServers.value)
        }

        toast.add({
            severity: 'success',
            summary: t('messages.success.update'),
            life: 3000
        })
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.update'),
            detail: e instanceof Error ? e.message : 'Unknown error',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="bg-surface-0 rounded-2xl p-6 shadow-sm border border-surface-200">
        <h2 class="text-xl font-bold text-surface-900 mb-6">
            {{ t('views.server_settings.general.title') }}
        </h2>

        <div class="flex flex-col gap-6">
            <!-- General information -->
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700">
                        {{ t('common.fields.name') }} <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        v-model="name"
                        :placeholder="t('views.create_server.placeholder.name')"
                        class="w-full"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-700">
                        {{ t('common.fields.description') }}
                    </label>
                    <Textarea
                        v-model="description"
                        rows="3"
                        auto-resize
                        :placeholder="t('views.create_server.placeholder.description')"
                    />
                </div>
            </div>

            <!-- Media -->
            <div class="grid grid-rows-1 gap-0">
                <div class="flex-1 flex flex-col gap-3">
                    <label class="text-sm font-medium text-surface-700">{{
                        t('common.fields.logo')
                    }}</label>
                    <EntityLogoHandling
                        :logo="logo"
                        :initial="name"
                        :entity-name="name"
                        :display-edit-button="true"
                        @update-logo="logo = $event"
                    />
                </div>

                <div class="flex-1 flex flex-col gap-3">
                    <label class="text-sm font-medium text-surface-700">{{
                        t('common.fields.banner')
                    }}</label>
                    <EntityBannerHandling
                        :banner="banner"
                        :display-edit-button="true"
                        @update-banner="banner = $event"
                    />
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end pt-4 border-t border-surface-100">
                <Button
                    :label="t('common.actions.save')"
                    icon="pi pi-save"
                    :loading="loading"
                    :disabled="!can_submit"
                    :style="{ background: 'var(--gradient-primary)' }"
                    @click="handleUpdate"
                />
            </div>
        </div>
    </div>
</template>
