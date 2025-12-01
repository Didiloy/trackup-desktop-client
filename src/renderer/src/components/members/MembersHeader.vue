<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'

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
    <div class="flex flex-col gap-6 mb-6">
        <div class="flex justify-between items-end">
            <div>
                <h1 class="text-2xl font-bold text-surface-900">
                    {{ t('views.server_members.title') }}
                </h1>
                <p class="text-surface-500 mt-1">
                    {{ t('views.members_aside.description') }}
                    <span
                        v-if="totalMembers"
                        class="ml-1 text-sm font-medium bg-surface-200 px-2 py-0.5 rounded-full text-surface-600"
                    >
                        {{ totalMembers }}
                    </span>
                </p>
            </div>
            <Button
                :label="t('views.server_members.invite_members')"
                icon="pi pi-user-plus"
                size="small"
                :style="{ background: 'var(--gradient-primary)' }"
                @click="emit('invite')"
            />
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
            <IconField class="w-full sm:w-96 flex-1">
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" :placeholder="t('placeholder.search')" class="w-full" />
            </IconField>

            <div class="flex gap-2 ml-auto">
                <Select
                    v-model="sort"
                    :options="sortOptions"
                    option-label="label"
                    option-value="value"
                    class="w-40"
                />
            </div>
        </div>
    </div>
</template>
