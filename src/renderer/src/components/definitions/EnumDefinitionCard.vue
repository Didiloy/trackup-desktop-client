<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useServerStore } from '@/stores/server'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import { enumDefGradientColorsList } from '@/components/definitions/constants/constants'

const { t } = useI18n()
const router = useRouter()
const server_store = useServerStore()

interface Props {
    definition: IEnumDefinition
    colorIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    colorIndex: 0
})

const MAX_VALUES_PER_CHUNK = 5

function flattenDefinitionValues(): string[] {
    if (!props.definition.values?.length) return []
    const flattened: string[] = []
    props.definition.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                flattened.push(val)
            }
        }
    })
    return flattened
}

function getChoicesPreview(): string[] {
    return flattenDefinitionValues()
}

function countChoices(): number {
    return flattenDefinitionValues().length
}

function getGradient(): string {
    return enumDefGradientColorsList[props.colorIndex % enumDefGradientColorsList.length]
}

function navigateToProfile(): void {
    router.push({
        name: 'ServerEnumDefinitionProfile',
        params: {
            id: server_store.getPublicId,
            enumDefinitionId: props.definition.public_id
        },
        query: { colorIndex: props.colorIndex.toString() }
    })
}
</script>

<template>
    <div
        class="group relative bg-surface-0 rounded-3xl overflow-hidden shadow-sm ring-1 ring-surface-200/60 hover:shadow-xl hover:ring-primary-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        @click="navigateToProfile"
    >
        <!-- Gradient Header -->
        <div
            class="h-28 bg-gradient-to-br relative overflow-hidden flex flex-col justify-center"
            :class="getGradient()"
        >
            <!-- Pattern overlay -->
            <div class="absolute inset-0 opacity-20">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="80" cy="20" r="30" fill="white" />
                    <circle cx="10" cy="80" r="20" fill="white" />
                </svg>
            </div>

            <!-- Icon centered at top -->
            <div
                class="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4"
            >
                <i class="pi pi-list text-2xl text-white"></i>
            </div>
        </div>

        <!-- Content -->
        <div class="p-5">
            <!-- Title & Description -->
            <div class="mb-4">
                <h3
                    class="font-bold text-lg text-surface-900 mb-1 group-hover:text-primary-600 transition-colors"
                >
                    {{ definition.name }}
                </h3>
                <p class="text-sm text-surface-500 line-clamp-2">
                    {{ definition.description || t('common.fields.no_description') }}
                </p>
            </div>

            <!-- Choices Section -->
            <div class="pt-4 border-t border-surface-100">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                        {{ t('common.fields.choices') }}
                    </span>
                    <span
                        class="text-xs font-bold bg-surface-100 text-surface-600 px-2 py-1 rounded-full"
                    >
                        {{ countChoices() }}
                    </span>
                </div>

                <div class="flex flex-wrap gap-1.5">
                    <span
                        v-for="(choice, idx) in getChoicesPreview().slice(0, 4)"
                        :key="idx"
                        class="text-xs font-medium px-2 py-1 rounded-lg bg-surface-100 text-surface-700"
                    >
                        {{ choice }}
                    </span>
                    <span
                        v-if="getChoicesPreview().length > 4"
                        class="text-xs font-medium px-2 py-1 rounded-lg bg-primary-100 text-primary-700"
                    >
                        +{{ getChoicesPreview().length - 4 }}
                    </span>
                </div>
            </div>

            <!-- View Stats Link -->
            <div class="mt-4 pt-3 border-t border-surface-100">
                <div
                    class="flex items-center justify-end text-sm text-primary-600 font-medium group-hover:underline"
                >
                    {{ t('views.server_enum_definitions.view_stats') }}
                    <i
                        class="pi pi-arrow-right text-xs ml-1 group-hover:translate-x-1 transition-transform"
                    ></i>
                </div>
            </div>
        </div>
    </div>
</template>
