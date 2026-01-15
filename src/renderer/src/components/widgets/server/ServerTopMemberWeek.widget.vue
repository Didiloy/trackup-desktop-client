<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import AvatarButton from '@/components/common/buttons/AvatarButton.vue'
import { useServerStore } from '@/stores/server'
import { useServerStatsStore } from '@/stores/server-stats'
import { useMemberNavigation } from '@/composables/members/useMemberNavigation'
import BaseWidgetContainer from '@/components/widgets/BaseWidgetContainer.vue'
import { type IWidgetMetadata } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'server-top-member-week',
        title_key: 'widgets.server.top_member_week.title',
        icon: 'pi pi-trophy',
        description_key: 'widgets.server.top_member_week.description',
        category: {
            key: EWidgetCategory.Server,
            label_key: 'widgets.categories.server'
        },
        defaultSize: { w: 2, h: 3, minW: 2, minH: 3 }
    } satisfies IWidgetMetadata
})

const { t } = useI18n()
const server_store = useServerStore()
const server_stats_store = useServerStatsStore()
const { navigateToMemberProfile } = useMemberNavigation()

const top_member_id = computed(() => server_stats_store.getDetails?.server_stats.top_member_week)
const top_member = computed(() => {
    if (!top_member_id.value) return null
    return server_store.getMemberById(top_member_id.value)
})

const HandleMemberClick = async (): Promise<void> => {
    if (top_member_id.value) {
        await navigateToMemberProfile(top_member_id.value)
    }
}
</script>

<template>
    <BaseWidgetContainer :loading="server_stats_store.isLoading">
        <template #header>
            <div class="px-5 pt-5 pb-3">
                <div class="flex items-center gap-2">
                    <i class="pi pi-trophy text-amber-500"></i>
                    <h3 class="text-lg font-bold text-surface-900">
                        {{ t('views.server_stats.top_member_week') }}
                    </h3>
                </div>
            </div>
        </template>

        <div
            v-if="!top_member"
            class="text-center py-8 text-surface-400 h-full flex items-center justify-center"
        >
            <div class="flex flex-col items-center gap-2">
                <i class="pi pi-inbox text-3xl"></i>
                <p class="text-sm">{{ t('common.fields.none') }}</p>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-full gap-4 cursor-pointer hover:bg-surface-50 rounded-xl transition-colors p-4"
            @click="HandleMemberClick"
        >
            <AvatarButton
                :image-url="top_member.avatar_url"
                :label="top_member.nickname"
                size="large"
                @click="HandleMemberClick"
            />
            <div class="text-center">
                <p class="text-lg font-bold text-surface-900">{{ top_member.nickname }}</p>
                <p class="text-sm text-surface-500">{{ t('views.server_stats.member_of_week') }}</p>
            </div>
        </div>
    </BaseWidgetContainer>
</template>
