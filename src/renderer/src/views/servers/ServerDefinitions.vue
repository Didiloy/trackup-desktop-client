<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import EnumDefinitionList from '@/components/servers/definitions/EnumDefinitionList.vue'

const { t } = useI18n()
</script>

<template>
    <div class="w-full h-full overflow-auto bg-surface-50">
        <div class="w-full mx-auto px-2 py-8">
            <TransitionWrapper name="slide-fade">
                <div class="flex flex-col gap-8 w-full">
                    <div>
                        <h1 class="text-3xl font-bold text-surface-900 tracking-tight">
                            {{ t('views.server_definitions.title') }}
                        </h1>
                        <p class="text-surface-500 text-lg max-w-2xl mt-2">
                            {{ t('views.server_definitions.description') }}
                        </p>
                    </div>

                    <EnumDefinitionList />
                </div>
            </TransitionWrapper>
        </div>
    </div>
</template>
