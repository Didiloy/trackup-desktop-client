<script setup lang="ts">
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import ServerGeneralProfile from '@renderer/components/servers/profile/ServerGeneralProfile.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <div class="w-full h-full overflow-y-auto bg-surface-50">
        <div class="max-w-5xl mx-auto px-6 py-8">
            <TransitionWrapper name="slide-fade">
                <div class="flex flex-col gap-8">
                    <!-- Header -->
                    <div class="flex flex-col gap-2">
                        <h1 class="text-3xl font-bold text-surface-900 tracking-tight">
                            {{ t('views.server_profile.title') }}
                        </h1>
                        <p class="text-surface-500 text-lg max-w-2xl">
                            {{ t('views.server_profile.subtitle') }}
                        </p>
                    </div>

                    <!-- Content -->
                    <ServerGeneralProfile />
                </div>
            </TransitionWrapper>
        </div>
    </div>
</template>
