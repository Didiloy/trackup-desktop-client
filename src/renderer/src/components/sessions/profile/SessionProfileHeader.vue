<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ISession } from '@shared/contracts/interfaces/entities/session.interfaces'
import { useServerStore } from '@/stores/server'
import { formatMinutesToLabel } from '@/utils/time.utils'
import { formatDate } from '@/utils'

interface Props {
    session: ISession | null
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const emit = defineEmits<{
    (e: 'edit'): void
    (e: 'delete'): void
    (e: 'like'): void
    (e: 'unlike'): void
}>()

const { t } = useI18n()
const server_store = useServerStore()

const bannerStyle = computed(() => {
    if (props.session?.activity.banner) {
        return { backgroundImage: `url(${props.session.activity.banner})` }
    }
    return {}
})

function handleLike() {
    if (!props.session) return
    if (props.session.liked_by_me) {
        emit('unlike')
    } else {
        emit('like')
    }
}
</script>

<template>
    <div
        class="relative w-full rounded-2xl bg-surface-0 border border-surface-200 shadow-sm overflow-hidden"
    >
        <!-- Skeleton Loading -->
        <div v-if="loading || !session" class="p-6 animate-pulse">
            <div class="h-48 bg-surface-200 rounded-xl mb-6"></div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="h-32 bg-surface-200 rounded-xl"></div>
                <div class="h-32 bg-surface-200 rounded-xl"></div>
                <div class="h-32 bg-surface-200 rounded-xl"></div>
                <div class="h-32 bg-surface-200 rounded-xl"></div>
            </div>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Banner Background (Blurred) -->
            <div
                v-if="session.activity.banner"
                class="absolute inset-0 h-48 bg-cover bg-center filter blur-xl opacity-50 z-0"
                :style="bannerStyle"
            ></div>

            <!-- Header Content -->
            <div class="relative z-10">
                <!-- Top Banner Area (if we want a specific look, otherwise we can just have the header below) -->
                <div class="h-32 w-full bg-linear-to-b from-black/20 to-transparent"></div>

                <div class="px-8 pb-8 flex flex-col items-start -mt-10">
                    <div class="flex flex-col md:flex-row items-end gap-6 w-full mb-8">
                        <!-- Logo -->
                        <div class="w-24 h-24 rounded-2xl bg-surface-0 p-1 shadow-lg shrink-0">
                            <img
                                v-if="session.activity.logo"
                                :src="session.activity.logo"
                                class="w-full h-full rounded-xl object-cover"
                                :alt="session.activity.name"
                            />
                            <div
                                v-else
                                class="w-full h-full rounded-xl bg-surface-100 flex items-center justify-center text-3xl font-bold text-surface-400"
                            >
                                {{ session.activity.name.charAt(0).toUpperCase() }}
                            </div>
                        </div>

                        <!-- Title & Details -->
                        <div class="flex-1 min-w-0 mb-1">
                            <div
                                class="flex items-center gap-2 text-surface-600 mb-1 font-medium text-sm"
                            >
                                <router-link
                                    :to="{
                                        name: 'ServerActivityProfile',
                                        params: {
                                            id: server_store.getPublicId,
                                            activityId: session.activity.public_id
                                        }
                                    }"
                                    class="hover:text-primary-600 hover:underline transition-colors"
                                >
                                    {{ session.activity.name }}
                                </router-link>
                            </div>
                            <h1
                                class="text-3xl font-bold text-surface-900 truncate"
                                :title="session.title"
                            >
                                {{ session.title }}
                            </h1>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 mb-1">
                            <Button
                                :icon="session.liked_by_me ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                :label="session.likes_count.toString()"
                                :severity="session.liked_by_me ? 'danger' : 'secondary'"
                                :outlined="!session.liked_by_me"
                                @click="handleLike"
                            />
                            <!-- Add Edit/Delete buttons logic here if needed, based on permissions -->
                        </div>
                    </div>

                    <!-- Widgets Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        <!-- Date Widget -->
                        <div
                            class="bg-surface-0 border border-surface-200 rounded-xl p-4 flex flex-col gap-2 shadow-xs"
                        >
                            <div
                                class="flex items-center gap-2 text-surface-500 text-sm font-medium"
                            >
                                <i class="pi pi-calendar text-primary-500"></i>
                                <span>{{ t('common.fields.date') }}</span>
                            </div>
                            <div class="text-lg font-semibold text-surface-900">
                                {{ formatDate(session.date) }}
                            </div>
                        </div>

                        <!-- Duration Widget -->
                        <div
                            class="bg-surface-0 border border-surface-200 rounded-xl p-4 flex flex-col gap-2 shadow-xs"
                        >
                            <div
                                class="flex items-center gap-2 text-surface-500 text-sm font-medium"
                            >
                                <i class="pi pi-clock text-primary-500"></i>
                                <span>{{ t('common.fields.duration') }}</span>
                            </div>
                            <div class="text-lg font-semibold text-surface-900">
                                {{ formatMinutesToLabel(Number(session.duration)) }}
                            </div>
                        </div>

                        <!-- Creator Widget -->
                        <div
                            class="bg-surface-0 border border-surface-200 rounded-xl p-4 flex flex-col gap-2 shadow-xs"
                            v-if="session.creator"
                        >
                            <div
                                class="flex items-center gap-2 text-surface-500 text-sm font-medium"
                            >
                                <i class="pi pi-user text-primary-500"></i>
                                <span>{{ t('common.fields.creator') }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <Avatar
                                    :image="session.creator.avatar_url ?? undefined"
                                    :label="
                                        !session.creator.avatar_url
                                            ? session.creator.nickname.charAt(0).toUpperCase()
                                            : undefined
                                    "
                                    shape="circle"
                                    class="w-6 h-6"
                                />
                                <span class="text-lg font-semibold text-surface-900 truncate">{{
                                    session.creator.nickname
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Description / Comment -->
            <div class="px-8 pb-8 relative z-10 pt-2">
                <div class="bg-surface-50 border border-surface-100 rounded-xl p-4">
                    <h3
                        class="text-sm font-medium text-surface-500 mb-2 uppercase tracking-wide flex items-center gap-2"
                    >
                        <i class="pi pi-align-left text-primary-500"></i>
                        {{ t('common.fields.description') }}
                    </h3>
                    <p
                        v-if="session.comment"
                        class="text-surface-700 whitespace-pre-wrap leading-relaxed"
                    >
                        {{ session.comment }}
                    </p>
                    <p
                        v-else
                        class="text-surface-400 italic"
                    >
                        {{ t('views.session_profile.no_description') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
