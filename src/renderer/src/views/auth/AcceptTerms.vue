<script setup lang="ts">
import { useAuth } from '@/composables/auth/useAuth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useAppNavigation } from '@/composables/app/useAppNavigation'

const { t } = useI18n()
const { acceptTerms } = useAuth()
const { navigateToHome } = useAppNavigation()

const loading = ref(false)
const accepted = ref(false)
const error = ref<string | null>(null)

function openTerms(): void {
    window.api.app.openExternal('https://trackup.so/cgu')
}

async function handleAccept(): Promise<void> {
    if (!accepted.value) return

    loading.value = true
    error.value = null

    try {
        await acceptTerms()
        await navigateToHome()
    } catch (e) {
        error.value = t('messages.error.save')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="w-full h-full flex items-center justify-center bg-surface-50">
        <div
            class="w-[420px] max-w-[90vw] bg-surface-0 rounded-2xl p-8 shadow-xl border border-surface-200"
        >
            <div class="flex flex-col items-center gap-6 mb-8">
                <img
                    src="@/assets/TrackUp_logo.png"
                    :alt="t('app.title')"
                    class="w-24 h-auto filter drop-shadow-sm"
                />
                <div class="text-center space-y-2">
                    <h1 class="text-2xl font-bold text-surface-900">{{ t('views.login.cgu') }}</h1>
                </div>
            </div>

            <div class="flex flex-col gap-6">
                <div class="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <div class="flex items-start gap-3">
                        <Checkbox v-model="accepted" binary input-id="terms" />
                        <label
                            for="terms"
                            class="text-sm text-surface-600 leading-snug cursor-pointer select-none"
                        >
                            <i18n-t keypath="views.login.terms_agreement" tag="span">
                                <template #link>
                                    <a
                                        href="#"
                                        class="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                        @click.stop.prevent="openTerms"
                                        >{{ t('views.login.cgu') }}</a
                                    >
                                </template>
                            </i18n-t>
                        </label>
                    </div>
                </div>

                <div
                    v-if="error"
                    class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100"
                >
                    {{ error }}
                </div>

                <Button
                    :label="t('common.actions.confirm')"
                    class="w-full"
                    :disabled="!accepted"
                    :loading="loading"
                    @click="handleAccept"
                />
            </div>
        </div>
    </div>
</template>
