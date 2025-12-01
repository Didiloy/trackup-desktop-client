<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import TextFilter from '@/components/filters/TextFilter.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import GenericPopover from '@/components/common/contexts/GenericPopover.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { useServerStore } from '@/stores/server'
import Button from 'primevue/button'

defineProps<{
    totalMembers?: number
}>()

const emit = defineEmits<{
    (e: 'update:search', value: string): void
    (e: 'update:searchField', value: 'nickname' | 'email'): void
    (e: 'update:joinedStartDate', value: Date | undefined): void
    (e: 'update:joinedEndDate', value: Date | undefined): void
    (e: 'invite'): void
}>()

const { t } = useI18n()
const search = ref('')
const search_field = ref<'nickname' | 'email'>('nickname')
const joined_date_range = ref<Date[] | null>(null)
const server_store = useServerStore()



const searchFieldOptions = computed(() => [
    { label: t('common.filters.search_modes.by_nickname'), value: 'nickname' },
    { label: t('common.filters.search_modes.by_email'), value: 'email' }
])

const activeFiltersCount = computed(() => {
    let count = 0
    if (joined_date_range.value && joined_date_range.value.length > 0) count++
    return count
})

watch(search, (val) => emit('update:search', val))
watch(search_field, (val) => emit('update:searchField', val))

function onDateRangeChange(value: Date[] | null): void {
    joined_date_range.value = value
    if (value && value.length === 2) {
        emit('update:joinedStartDate', value[0])
        emit('update:joinedEndDate', value[1])
    } else if (value && value.length === 1) {
        emit('update:joinedStartDate', value[0])
        emit('update:joinedEndDate', undefined)
    } else {
        emit('update:joinedStartDate', undefined)
        emit('update:joinedEndDate', undefined)
    }
}

function clearFilters(): void {
    joined_date_range.value = null
    emit('update:joinedStartDate', undefined)
    emit('update:joinedEndDate', undefined)
}
</script>

<template>
    <div class="flex flex-row items-center justify-between w-full h-12 p-2">
        <h2 class="text-2xl font-bold">
            {{ t('views.server_members.title') }}
        </h2>
        <div v-if="server_store.isOwnership" class="flex flex-row items-center justify-center">
            <Button
                :label="t('views.server_members.invite_members')"
                icon="pi pi-user-plus"
                size="small"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="emit('invite')"
            />
        </div>
    </div>

    <div class="w-full px-2 pb-2">
        <GenericFilterBar :count="totalMembers">
            <template #primary-filters>
                <span class="flex-1 w-[20px]">
                    <TextFilter
                        v-model="search"
                        :placeholder="
                            search_field === 'nickname'
                                ? t('placeholder.search_nickname')
                                : t('placeholder.search_email')
                        "
                        icon="pi pi-search"
                        class="sm:w-96"
                    />
                </span>
            </template>

            <template #actions>
                <GenericPopover
                    button-icon="pi pi-filter"
                    :popover-class="'w-fit-content'"
                    :button-badge="
                        activeFiltersCount > 0 ? activeFiltersCount.toString() : undefined
                    "
                    button-badge-severity="info"
                >
                    <template #content>
                        <div class="flex flex-col gap-4 p-4 bg-surface-0 rounded-md">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold text-surface-900">{{
                                    t('common.filters.title')
                                }}</span>
                                <Button
                                    :label="t('common.actions.clear_all')"
                                    link
                                    size="small"
                                    class="p-0"
                                    @click="clearFilters"
                                />
                            </div>

                            <!-- Name Or Email Sort -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                        t('views.server_members.title_base').toLowerCase()
                                }}</label>
                                <SelectFilter
                                    v-model="search_field"
                                    :options="searchFieldOptions"
                                    class="w-48"
                                />
                            </div>

                            <!-- Joined Date Filter -->
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-medium text-surface-700">{{
                                    t('common.filters.joined_date')
                                }}</label>
                                <DateRangeFilter
                                    :model-value="joined_date_range"
                                    @update:model-value="onDateRangeChange"
                                />
                            </div>
                        </div>
                    </template>
                </GenericPopover>
            </template>
        </GenericFilterBar>
    </div>
</template>
