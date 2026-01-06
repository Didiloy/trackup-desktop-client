<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useServerStore } from '@/stores/server'
import { useSessionCRUD } from '@/composables/sessions/useSessionCRUD'
import type { ISession } from '@shared/contracts/interfaces/entities/session.interfaces'

import SessionProfileHeader from '@/components/sessions/profile/SessionProfileHeader.vue'
import SessionParticipants from '@/components/sessions/profile/SessionParticipants.vue'
import SessionMetadata from '@/components/sessions/profile/SessionMetadata.vue'
import SessionEnumDefinitions from '@/components/sessions/profile/SessionEnumDefinitions.vue'
import TransitionWrapper from '@/components/common/transitions/TransitionWrapper.vue'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const server_store = useServerStore()
const { getSessionById, likeSession, unlikeSession } = useSessionCRUD()

const sessionId = computed(() => route.params.sessionId as string)
const session = ref<ISession | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadSession() {
    if (!server_store.getPublicId || !sessionId.value) return

    loading.value = true
    error.value = null

    try {
        const res = await getSessionById(server_store.getPublicId, sessionId.value)
        if (res.error || !res.data) {
            error.value = res.error ?? t('messages.error.fetch')
            return
        }
        session.value = res.data
    } catch (e) {
        error.value = e instanceof Error ? e.message : t('messages.error.fetch')
    } finally {
        loading.value = false
    }
}

async function handleLike() {
    if (!session.value || !server_store.getPublicId) return

    try {
        if (session.value.liked_by_me) {
            await unlikeSession(server_store.getPublicId, session.value.public_id)
            session.value.liked_by_me = false
            session.value.likes_count--
        } else {
            await likeSession(server_store.getPublicId, session.value.public_id)
            session.value.liked_by_me = true
            session.value.likes_count++
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('messages.error.update'),
            detail: e instanceof Error ? e.message : String(e),
            life: 2500
        })
    }
}

watch(
    () => [server_store.getPublicId, sessionId.value],
    () => {
        if (server_store.getPublicId && sessionId.value) {
            void loadSession()
        }
    },
    { immediate: true }
)

onMounted(async () => {
    if (server_store.getPublicId && sessionId.value) {
        await loadSession()
    }
})
</script>

<template>
    <div class="w-full h-full overflow-auto px-4 py-6 bg-surface-50">
        <!-- Error State -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {{ error }}
        </div>

        <!-- content -->
        <TransitionWrapper name="slide-fade" :duration="0.25" appear mode="out-in">
            <div v-if="session || loading" key="content" class="space-y-6 max-w-7xl mx-auto">
                <SessionProfileHeader
                    :session="session"
                    :loading="loading"
                    @like="handleLike"
                    @unlike="handleLike"
                />

                <div v-if="session" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Participants (takes 1 col on large screens) -->
                    <div class="space-y-6">
                        <SessionParticipants
                            :participants="session.server_member"
                            :creator="session.creator"
                        />
                    </div>

                    <!-- Right Column: Metadata (takes 2 cols on large screens) -->
                    <div class="lg:col-span-2 space-y-6">
                        <SessionEnumDefinitions :enums="session.enum_definitions" />

                        <SessionMetadata :metadata="session.metadata" />
                    </div>
                </div>
            </div>
        </TransitionWrapper>
    </div>
</template>
