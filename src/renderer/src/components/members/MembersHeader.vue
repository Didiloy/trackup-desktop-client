<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import GenericFilterBar from '@/components/filters/GenericFilterBar.vue'
import TextFilter from '@/components/filters/TextFilter.vue'
import SelectFilter from '@/components/filters/SelectFilter.vue'
import SessionFilterBar from '@/components/sessions/SessionFilterBar.vue'

defineProps<{
    totalMembers?: number
}>()

const emit = defineEmits<{
    (e: 'update:search', value: string): void
    (e: 'update:sort', value: string): void
    (e: 'invite'): void
}>()

const { t } = useI18n()
const search = ref('')
const sort = ref('name')

const sortOptions = computed(() => [
    { label: t('common.filters.sort.name'), value: 'name' },
    { label: t('common.filters.sort.date'), value: 'date' },
    { label: t('common.filters.sort.joined_at'), value: 'joined_at' }
])

watch(search, (val) => emit('update:search', val))
watch(sort, (val) => emit('update:sort', val))
</script>

<template>

        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ t('views.server_members.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
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
                    <TextFilter
                        v-model="search"
                        :placeholder="t('placeholder.search')"
                        icon="pi pi-search"
                        class="sm:w-96"
                    />
                </template>

                <template #actions>
                    <SelectFilter
                        v-model="sort"
                        :options="sortOptions"
                        class="w-40"
                    />
                </template>
            </GenericFilterBar>
        </div>

</template>
