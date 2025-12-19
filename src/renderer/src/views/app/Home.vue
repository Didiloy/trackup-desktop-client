<script setup lang="ts">
import Versions from '@/components/app-updates/Versions.vue'

import { useAuth } from '@/composables/auth/useAuth'
import ThemeSelector from '@/components/common/selectors/ThemeSelector.vue'
import LanguageSelector from '@/components/common/selectors/LanguageSelector.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { signOut } = useAuth()
</script>

<template>
    <div class="w-full h-full flex flex-col items-center justify-center">
        <div class="actions">
            <div class="action">
                <Button :label="t('views.login.logout_button')" @click="signOut"></Button>
            </div>
        </div>
        <Versions />
        <ThemeSelector />
        <LanguageSelector />
    </div>
</template>
