<script setup lang="ts">
import { ref, computed } from 'vue'
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
    <div class="flex flex-col gap-6 pb-20">
        <!-- General Info Card -->
        <section class="bg-surface-0 rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-surface-200/60">
            <div class="flex items-center gap-4 mb-8 border-b border-surface-100 pb-6">
                <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 ring-1 ring-primary-100 dark:ring-primary-500/20">
                    <i class="pi pi-info-circle text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-surface-900">
                        {{ t('views.server_profile.general_info') }}
                    </h2>
                    <p class="text-surface-500 text-sm mt-1">
                        {{ t('views.server_settings.general.server_name') }} & {{ t('views.server_settings.general.server_description') }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 max-w-3xl">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-surface-700">
                        {{ t('common.fields.name') }} <span class="text-red-500">*</span>
                    </label>
                    <InputText
                        v-model="name"
                        :placeholder="t('views.create_server.placeholder.name')"
                        class="w-full bg-surface-50 border-surface-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-surface-700">
                        {{ t('common.fields.description') }}
                    </label>
                    <Textarea
                        v-model="description"
                        rows="4"
                        auto-resize
                        :placeholder="t('views.create_server.placeholder.description')"
                        class="w-full bg-surface-50 border-surface-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                    <p class="text-xs text-surface-400 text-right">
                        {{ description.length }}/500
                    </p>
                </div>
            </div>
        </section>

        <!-- Branding Card -->
        <section class="bg-surface-0 rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-surface-200/60">
            <div class="flex items-center gap-4 mb-8 border-b border-surface-100 pb-6">
                <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 ring-1 ring-purple-100">
                    <i class="pi pi-palette text-xl"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-surface-900">
                        {{ t('common.fields.logo') }} & {{ t('common.fields.banner') }}
                    </h2>
                    <p class="text-surface-500 text-sm mt-1">
                        {{ t('views.server_settings.general.update_logo') }} & {{ t('views.server_settings.general.update_banner') }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-10">
                <div class="flex flex-col gap-4">
                    <label class="text-sm font-semibold text-surface-700">
                        {{ t('common.fields.logo') }}
                    </label>
                    <div class="p-4 rounded-2xl bg-surface-50 ring-1 ring-surface-200">
                        <EntityLogoHandling
                            :logo="logo"
                            :initial="name"
                            :entity-name="name"
                            :display-edit-button="true"
                            @update-logo="logo = $event"
                        />
                    </div>
                    <p class="text-xs text-surface-400">
                        {{ t('views.server_profile.update_logo') }}
                    </p>
                </div>

                <div class="flex flex-col gap-4">
                    <label class="text-sm font-semibold text-surface-700">
                        {{ t('common.fields.banner') }}
                    </label>
                    <div class="p-4 rounded-2xl bg-surface-50 ring-1 ring-surface-200">
                        <EntityBannerHandling
                            :banner="banner"
                            :display-edit-button="true"
                            @update-banner="banner = $event"
                        />
                    </div>
                    <p class="text-xs text-surface-400">
                        {{ t('views.server_profile.update_banner') }}
                    </p>
                </div>
            </div>
        </section>

        <!-- Floating Action Bar -->
        <div class="fixed bottom-6 right-6 z-20">
            <Transition 
                enter-active-class="transform ease-out duration-300 transition"
                enter-from-class="translate-y-10 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition ease-in duration-200"
                leave-from-class="opacity-100"
                leave-to-class="translate-y-10 opacity-0"
            >
                <div v-if="has_changes" class="bg-primary-900/80 backdrop-blur-lg text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-surface-700/50">
                    <div class="flex flex-col">
                        <span class="font-semibold text-sm">{{ t('views.server_profile.update_floating_bar.title') }}</span>
                        <span class="text-xs text-gray-300">{{ t('views.server_profile.update_floating_bar.description') }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                         <Button
                            :label="t('views.server_profile.update_floating_bar.save')"
                            icon="pi pi-check"
                            :loading="loading"
                            rounded
                            :style="{ background: 'var(--gradient-secondary)' }"
                            @click="handleUpdate"
                        />
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

