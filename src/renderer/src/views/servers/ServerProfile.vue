<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'
import { useServerStore } from '@/stores/server'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const server_id = ref<string>(route.params.id as string)
const server_store = useServerStore()
</script>

<template>
    <div class="p-4">
        <TransitionWrapper name="slide-fade">
            <div v-if="server_store.isLoading" key="loading" class="flex flex-col gap-4">
                <Skeleton shape="circle" width="6rem" height="6rem" />
                <Skeleton width="100%" height="2rem" />
                <Skeleton width="80%" height="1.5rem" />
            </div>
            <div v-else-if="server_store.hasServer" :key="server_id">
                <h1>{{ t('views.server_profile.title') }}</h1>
                <p>
                    {{ server_store.getName }}
                    {{ server_store.getInvitationCode }}
                    {{ server_store.getMembers?.length }} {{ t('views.server_members.title') }}
                    {{ server_store.getDescription }}
                    {{ server_store.getInvitationCodeExpDate }}
                    {{ server_store.getServerTypePublicId }}
                </p>
            </div>
        </TransitionWrapper>
    </div>
</template>
