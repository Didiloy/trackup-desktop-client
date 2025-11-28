<script setup lang="ts">
import type { ISessionListItem } from '@shared/contracts/interfaces/entities/session.interfaces'
import { useI18n } from 'vue-i18n'
import { convertMinuteToHoursMinute } from '@/utils'

interface Props {
    session: ISessionListItem
}

interface Emits {
    (e: 'like', sessionId: string): void
    (e: 'unlike', sessionId: string): void
    (e: 'load-more'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString()
}

function toggleLike(session: ISessionListItem): void {
    if (session.liked_by_me) {
        emit('unlike', session.public_id)
    } else {
        emit('like', session.public_id)
    }
}

function getParticipantTooltip(
    participant: ISessionListItem['server_member'][number],
    session: ISessionListItem
): string {
    const isCreator = participant.public_id === session.creator.member_public_id
    return isCreator
        ? `${participant.nickname} • ${t('common.fields.creator')}`
        : participant.nickname
}
</script>

<template>
    <div
        class="group relative rounded-2xl border border-surface-200 shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer"
    >
        <div
            v-if="session.activity.banner"
            class="absolute inset-1 rounded-2xl bg-cover bg-cente bg-no-repeat"
            :style="{ backgroundImage: `url(${session.activity.banner})` }"
        />
        <div class="absolute inset-0 bg-surface-100/55 backdrop-blur-3xl rounded-2xl" />
        <!-- Banner -->
        <div class="relative h-20 w-full overflow-hidden z-10">
            <!-- Logo + Title -->
            <div class="absolute top-4 left-4 flex items-start gap-3">
                <img
                    v-if="session.activity.logo"
                    :src="session.activity.logo"
                    class="w-12 h-12 rounded-xl object-cover ring-black/20"
                    :alt="session.activity.name"
                />
                <div
                    v-else
                    class="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center text-lg font-bold text-surface-700 ring ring-black/20"
                >
                    {{ session.activity.name.charAt(0).toUpperCase() }}
                </div>

                <div class="flex flex-col leading-tight justify-center items-start h-12">
                    <!-- Titre de la session (principal) -->
                    <h2 class="text-l font-bold text-surface-900 drop-shadow">
                        {{ session.title }}
                    </h2>

                    <!-- Nom de l’activité (secondaire) -->
                    <h3 class="text-md font-medium text-surface-600 drop-shadow">
                        {{ session.activity.name }}
                    </h3>
                </div>
            </div>
        </div>

        <!-- Body -->
        <div class="p-5 flex flex-col gap-4 z-10">
            <!-- Meta: duration + date -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-surface-700 font-medium z-10">
                    <i class="pi pi-clock text-primary-500"></i>
                    <span>{{
                        convertMinuteToHoursMinute(session.duration as unknown as number)
                    }}</span>
                </div>

                <div class="flex items-center gap-2 text-surface-600 font-medium z-10">
                    <i class="pi pi-calendar text-primary-500"></i>
                    <span>{{ formatDate(session.date) }}</span>
                </div>
            </div>

            <!-- Participants -->
        </div>

        <!-- Footer -->
        <div class="p-5 pt-0 flex justify-between items-end z-10">
            <div>
                <div class="flex -space-x-3">
                    <div
                        v-for="participant in session.server_member.slice(0, 4)"
                        :key="participant.public_id"
                        v-tooltip.top="getParticipantTooltip(participant, session)"
                        class="z-10 w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-200 shadow-sm"
                    >
                        <img
                            v-if="participant.avatar_url"
                            :src="participant.avatar_url"
                            class="w-full h-full object-cover"
                            :alt="participant.nickname"
                        />
                        <span
                            v-else
                            class="z-10 flex items-center justify-center w-full h-full font-semibold text-surface-700"
                        >
                            {{ participant.nickname.charAt(0).toUpperCase() }}
                        </span>
                    </div>

                    <div
                        v-if="session.participants_count > 4"
                        class="z-10 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-white shadow-sm"
                    >
                        +{{ session.participants_count - 4 }}
                    </div>
                </div>

                <p class="z-10 text-sm text-surface-600 mt-2 relative">
                    {{ session.participants_count }}
                    {{
                        session.participants_count === 1
                            ? t('views.server_sessions.session_details.participant')
                            : t('views.server_sessions.session_details.participants')
                    }}
                </p>
            </div>
            <Button
                :icon="session.liked_by_me ? 'pi pi-heart-fill' : 'pi pi-heart'"
                :label="session.likes_count.toString()"
                :severity="session.liked_by_me ? 'danger' : 'secondary'"
                :outlined="!session.liked_by_me"
                size="small"
                class="px-4! py-2! h-fit"
                @click.stop="toggleLike(session)"
            />
        </div>
    </div>
</template>
