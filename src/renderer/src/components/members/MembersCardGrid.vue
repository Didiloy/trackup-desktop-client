<script setup lang="ts">
import type { IServerMember } from '@shared/contracts/interfaces/entities/member.interfaces'
import { computed } from 'vue'
import MemberCard from '@/components/members/MemberCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
    members: IServerMember[]
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const isEmpty = computed(() => props.members.length === 0 && !props.loading)
</script>

<template>
    <div class="w-full h-full overflow-y-auto p-2">
        <!-- Members Grid -->
        <TransitionGroup
            name="fade"
            tag="div"
            class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8"
        >
            <MemberCard
                v-for="member in members"
                :key="member.public_id"
                :member="member"
            />
        </TransitionGroup>

        <!-- Loading State -->
        <div
            v-if="loading && members.length === 0"
            class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pb-8"
        >
            <div
                v-for="n in 6"
                :key="n"
                class="group relative rounded-2xl border border-surface-200 shadow-sm overflow-hidden p-5 flex items-center gap-4"
            >
                <!-- Skeleton Avatar -->
                <div class="w-14 h-14 rounded-full bg-surface-200 animate-pulse shrink-0"></div>

                <!-- Skeleton Info -->
                <div class="flex-1 min-w-0 flex flex-col gap-2">
                    <div class="w-32 h-4 bg-surface-200 animate-pulse rounded"></div>
                    <div class="w-24 h-3 bg-surface-200 animate-pulse rounded"></div>
                </div>

                <!-- Skeleton Button -->
                <div class="w-8 h-8 bg-surface-200 animate-pulse rounded-full shrink-0"></div>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="isEmpty"
            class="flex flex-col items-center justify-center h-full min-h-[400px]"
        >
            <i class="pi pi-users text-7xl text-surface-300 mb-4"></i>
            <p class="text-xl font-medium text-surface-600">{{ t('common.filters.no_results') }}</p>
            <p class="text-sm text-surface-500 mt-2">{{ t('common.filters.try_adjusting') }}</p>
        </div>
    </div>
</template>
