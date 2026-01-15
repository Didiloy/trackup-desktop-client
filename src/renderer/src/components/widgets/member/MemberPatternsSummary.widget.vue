<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import { useMemberStatsCRUD } from '@/composables/members/useMemberStatsCRUD'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import {
    type IWidgetMetadata,
    type IMemberWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IMemberActivityPatterns } from '@shared/contracts/interfaces/entities-stats/member-stats.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'
import MemberIdentityCorner from '@/components/members/profile/MemberIdentityCorner.vue'

defineOptions({
    widgetMetadata: {
        id: 'member-activity-patterns',
        title_key: 'widgets.member.activity_patterns.title',
        icon: 'pi pi-calendar',
        description_key: 'widgets.member.activity_patterns.description',
        category: {
            key: EWidgetCategory.Member,
            label_key: 'widgets.categories.member'
        },
        defaultSize: { w: 4, h: 5, minW: 4, minH: 5 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IMemberWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)
const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()
const { getMemberStatsPatterns } = useMemberStatsCRUD()

const memberId = computed(() => (route.params.memberId as string) || props.config?.memberId)
const patterns = ref<IMemberActivityPatterns | null>(null)
const isLoading = ref(false)

async function fetchPatterns(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!memberId.value || !serverId) return

    isLoading.value = true
    try {
        const res = await getMemberStatsPatterns(serverId, memberId.value)
        if (res.data) {
            patterns.value = res.data
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchPatterns()
})

watch(
    () => [server_store.getPublicId, memberId.value],
    () => {
        void fetchPatterns()
    }
)

const weekdays = computed(() => [
    t('common.weekdays.short.sunday'),
    t('common.weekdays.short.monday'),
    t('common.weekdays.short.tuesday'),
    t('common.weekdays.short.wednesday'),
    t('common.weekdays.short.thursday'),
    t('common.weekdays.short.friday'),
    t('common.weekdays.short.saturday')
])

const mostActiveDay = computed(() => {
    if (patterns.value?.most_active_day_of_week == null) return null
    return weekdays.value[patterns.value.most_active_day_of_week]
})

const mostActiveHour = computed(() => {
    if (patterns.value?.most_active_hour == null) return null
    return `${patterns.value.most_active_hour}h`
})
</script>

<template>
    <BaseWidgetContainer :title="t('views.server_members.patterns.title')" :loading="isLoading">
        <MemberIdentityCorner
            class="top-10 ml-53"
            :show="props.showIdentity"
            :member-id="memberId"
        />
        <div v-if="patterns" class="space-y-6">
            <div>
                <h4 class="text-sm font-medium mb-3">
                    {{ t('views.server_members.patterns.most_active') }}
                </h4>
                <div class="space-y-2">
                    <div
                        v-if="mostActiveDay"
                        class="flex items-center justify-between p-2 rounded-xl bg-primary-50"
                    >
                        <span class="text-sm">{{ t('views.server_members.patterns.day') }}</span>
                        <span class="font-bold text-primary-500">{{ mostActiveDay }}</span>
                    </div>
                    <div
                        v-if="mostActiveHour"
                        class="flex items-center justify-between p-2 rounded-xl bg-blue-50"
                    >
                        <span class="text-sm">{{ t('views.server_members.patterns.hour') }}</span>
                        <span class="font-bold text-blue-500">{{ mostActiveHour }}</span>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="text-sm font-medium mb-3">
                    {{ t('views.server_members.patterns.streaks') }}
                </h4>
                <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-green-50">
                        <span class="text-sm">{{
                            t('views.server_members.patterns.current_streak')
                        }}</span>
                        <span class="font-bold text-green-500"
                            >{{ patterns.streak_current }} {{ t('common.time.days') }}</span
                        >
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl bg-orange-50">
                        <span class="text-sm">{{
                            t('views.server_members.patterns.longest_streak')
                        }}</span>
                        <span class="font-bold text-orange-500"
                            >{{ patterns.streak_longest }} {{ t('common.time.days') }}</span
                        >
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
            {{ t('common.fields.no_data') }}
        </div>
    </BaseWidgetContainer>
</template>
