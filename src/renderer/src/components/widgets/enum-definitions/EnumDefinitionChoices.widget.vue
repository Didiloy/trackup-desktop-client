<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useServerStore } from '@/stores/server'
import type {
    IWidgetMetadata,
    IEnumDefinitionWidgetConfig
} from '@shared/contracts/interfaces/widget.interfaces'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import EnumDefinitionIdentityCorner from '@/components/enum-definitions/profile/EnumDefinitionIdentityCorner.vue'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

defineOptions({
    widgetMetadata: {
        id: 'enum-definitions-choices',
        title_key: 'widgets.enum_definition.choices.title',
        icon: 'pi pi-check-square',
        description_key: 'widgets.enum_definition.choices.description',
        category: {
            key: EWidgetCategory.EnumDefinition,
            label_key: 'widgets.categories.enum_definition'
        },
        defaultSize: { w: 4, h: 4, minW: 3, minH: 3 },
        requiresConfig: true
    } satisfies IWidgetMetadata
})

const props = withDefaults(
    defineProps<{
        showIdentity?: boolean
        config?: IEnumDefinitionWidgetConfig
    }>(),
    {
        showIdentity: true,
        config: undefined
    }
)

const { t } = useI18n()
const route = useRoute()
const server_store = useServerStore()

const definitionId = computed(
    () => (route.params.enumDefinitionId as string) || props.config?.enumDefinitionId
)

const MAX_VALUES_PER_CHUNK = 5

// Get definition directly from server store
const definition = computed<IEnumDefinition | null>(() => {
    const definitions = server_store.getEnumsDefinition
    if (!definitions || !definitionId.value) return null
    return definitions.find((d) => d.public_id === definitionId.value) || null
})

const loading = computed(() => server_store.isLoading)

const choices = computed(() => {
    if (!definition.value?.values?.length) return []
    const flattened: string[] = []
    definition.value.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                flattened.push(val)
            }
        }
    })
    return flattened
})
</script>

<template>
    <div class="relative bg-surface-0 rounded-3xl p-6 shadow-sm ring-1 ring-surface-200/60 h-full">
        <EnumDefinitionIdentityCorner :show="props.showIdentity" :definition-id="definitionId" />
        <!-- Header -->
        <div class="flex items-center gap-3 mb-5">
            <div
                class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"
            >
                <i class="pi pi-check-square text-lg"></i>
            </div>
            <div>
                <h3 class="font-semibold text-surface-900">
                    {{ t('widgets.enum_definition.choices.title') }}
                </h3>
                <p class="text-sm text-surface-500">
                    {{ choices.length }} {{ t('common.fields.items') }}
                </p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-wrap gap-2">
            <Skeleton v-for="i in 6" :key="i" width="80px" height="32px" class="rounded-lg" />
        </div>

        <!-- Empty State -->
        <div
            v-else-if="!choices.length"
            class="flex flex-col items-center justify-center py-8 text-surface-400"
        >
            <i class="pi pi-list text-3xl mb-2"></i>
            <p class="text-sm">{{ t('common.fields.no_data') }}</p>
        </div>

        <!-- Choices Grid -->
        <div v-else class="flex flex-wrap gap-2">
            <span
                v-for="(choice, idx) in choices"
                :key="idx"
                class="px-3 py-1.5 rounded-xl text-sm font-medium bg-surface-100 text-surface-700 ring-1 ring-inset ring-surface-200 transition-transform hover:scale-105 hover:bg-surface-200"
            >
                {{ choice }}
            </span>
        </div>
    </div>
</template>
