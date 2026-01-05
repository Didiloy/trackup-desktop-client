<script setup lang="ts">
import { computed, type Component } from 'vue'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface StepItem {
    label?: string
    key?: string
    icon?: string | Component
}

interface Props {
    modelValue: boolean
    steps?: StepItem[]
    current?: number
    title?: string
    subtitle?: string
    iconClass?: string
    styleClass?: string
    contentClass?: string
    closable?: boolean
    dismissableMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    subtitle: '',
    iconClass: 'pi pi-list',
    steps: () => [],
    current: 0,
    styleClass: 'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2',
    contentClass: 'p-0 bg-surface-50',
    closable: true,
    dismissableMask: true
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'hide'): void
    (e: 'show'): void
}>()

const safeCurrent = computed(() => {
    if (!props.steps.length) return 0
    return Math.min(Math.max(props.current, 0), props.steps.length - 1)
})
</script>

<template>
    <AppDialog
        :model-value="modelValue"
        :style-class="styleClass"
        :content-class="contentClass"
        :closable="closable"
        :dismissable-mask="dismissableMask"
        @update:model-value="(v: boolean) => emit('update:modelValue', v)"
        @hide="emit('hide')"
        @show="emit('show')"
    >
        <template #header>
            <div class="flex flex-col gap-2 p-3">
                <div class="flex items-center gap-2">
                    <i :class="iconClass + ' text-primary-500'"></i>
                    <span class="font-semibold text-surface-900">{{ title }}</span>
                </div>
                <div v-if="subtitle" class="text-xs text-surface-600">
                    {{ subtitle }}
                </div>

                <!-- Breadcrumb / Steps -->
                <div v-if="steps.length" class="flex items-center gap-2 mt-1">
                    <template v-for="(step, index) in steps" :key="step.key || index">
                        <div class="flex items-center gap-2">
                            <div
                                class="flex items-center gap-2"
                                :class="{
                                    'text-primary-600': index === safeCurrent,
                                    'text-surface-500': index !== safeCurrent
                                }"
                            >
                                <div
                                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                    :class="
                                        index === safeCurrent
                                            ? 'bg-primary-400 text-primary-600'
                                            : 'bg-surface-100'
                                    "
                                >
                                    <i v-if="typeof step.icon === 'string'" :class="step.icon"></i>
                                    <component :is="step.icon" v-else-if="step.icon" />
                                    <span v-else>{{ index + 1 }}</span>
                                </div>
                                <span class="text-xs font-medium">
                                    {{
                                        step.label ||
                                        t('common.steps.generic', { index: index + 1 })
                                    }}
                                </span>
                            </div>
                        </div>
                        <i
                            v-if="index < steps.length - 1"
                            class="pi pi-angle-right text-surface-400"
                        ></i>
                    </template>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="p-4 flex flex-col h-full">
            <slot />
        </div>

        <template #footer>
            <slot name="footer" />
        </template>
    </AppDialog>
</template>
