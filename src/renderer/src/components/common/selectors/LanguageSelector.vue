<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { getAvailableLanguages, Language, setI18nLanguage } from '@/i18n'

import Select from 'primevue/select'

const i18n = useI18n()
const toast = useToast()

const languages = ref<Language[]>(getAvailableLanguages())
const current_language = ref(i18n.locale.value)

onMounted(() => {
    current_language.value = i18n.locale.value
})

const switchLanguage = async (event: { value: string }): Promise<void> => {
    const locale = event.value

    try {
        localStorage.setItem('locale', locale)

        const result = await setI18nLanguage(locale)
        if (result) {
            toast.add({
                severity: 'success',
                summary: i18n.t('views.user_profile_menu.preferences.language.switch.success'),
                life: 3000
            })
        } else {
            toast.add({
                severity: 'error',
                summary: i18n.t('views.user_profile_menu.preferences.language.switch.error'),
                detail: i18n.t('views.user_profile_menu.preferences.language.switch.error_detail'),
                life: 3000
            })
        }
    } catch (error) {
        console.error('Error switching language:', error)
        toast.add({
            severity: 'error',
            summary: i18n.t('views.user_profile_menu.preferences.language.switch.error'),
            detail: i18n.t('views.user_profile_menu.preferences.language.switch.error_detail'),
            life: 3000
        })
    }
}
</script>

<template>
    <div class="language-switcher">
        <h3>{{ i18n.t('views.user_profile_menu.preferences.language.title') }}</h3>
        <Select
            v-model="current_language"
            :options="languages"
            option-label="name"
            option-value="code"
            class="language-select"
            @change="switchLanguage"
        >
            <template #value="slotProps">
                <div v-if="slotProps.value" class="language-option">
                    <span class="language-flag">{{
                        languages.find((lang) => lang.code === slotProps.value)?.flag || '🌐'
                    }}</span>
                    <span class="language-name">{{
                        languages.find((lang) => lang.code === slotProps.value)?.name || ''
                    }}</span>
                </div>
                <span v-else>{{ i18n.t('views.user_profile_menu.preferences.language.title') }}</span>
            </template>
            <template #option="slotProps">
                <div class="language-option">
                    <span class="language-flag">{{ slotProps.option.flag }}</span>
                    <span class="language-name">{{ slotProps.option.name }}</span>
                </div>
            </template>
        </Select>
    </div>
</template>

<style scoped>
.language-switcher {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
}

.language-select {
    max-width: 135px;
    width: 100%;
}

.language-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.language-flag {
    font-size: 1.2rem;
}

.language-name {
    font-size: 0.9rem;
}
</style>
