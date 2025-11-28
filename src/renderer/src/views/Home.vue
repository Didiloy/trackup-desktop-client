<script setup lang="ts">
import Versions from '@/components/Versions.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuth } from '@/composables/auth/useAuth'
import ThemeSelector from '@/components/common/selectors/ThemeSelector.vue'
import LanguageSelector from '@/components/common/selectors/LanguageSelector.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const ipcHandle = (): void => window.api.app.ping()
const user_store = useUserStore()
const { signOut } = useAuth()

onMounted(() => {
    console.log('Home component mounted')
    console.log('User Store State:', user_store.$state)
    console.log('User Store getUsername:', user_store.getUsername)
    console.log('User Store getAvatar:', user_store.getAvatar)
    console.log('User Store getId:', user_store.getId)
    console.log('User Store getEmail:', user_store.getEmail)
    console.log('User Store getAccessToken:', user_store.getAccessToken)
})
</script>

<template>
    <div class="w-full h-full flex flex-col items-center justify-center">
        <div class="creator">{{ t('home.powered_by') }}</div>
        <div class="text" v-html="t('home.build_desc', { vue: 'Vue', typescript: 'TypeScript' })"></div>
        <p class="tip" v-html="t('home.dev_tool_tip')"></p>
        <div class="actions">
            <div class="action">
                <a href="https://electron-vite.org/" target="_blank" rel="noreferrer"
                    >{{ t('home.documentation') }}</a
                >
            </div>
            <div class="action">
                <Button
                    :label="t('home.send_ipc')"
                    class="text-white border-0 px-4 py-2 rounded-lg transition hover:opacity-90"
                    :style="{ background: 'var(--gradient-primary)' }"
                    @click="ipcHandle"
                />
                <Button :label="t('userInterface.loginView.logout')" @click="signOut"></Button>
            </div>
        </div>
        <Versions />
        <ThemeSelector />
        <LanguageSelector />
    </div>
</template>
