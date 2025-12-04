<script setup lang="ts">
import Dialog from 'primevue/dialog'

interface Props {
    modelValue: boolean
    headerComponent?: unknown
    headerProps?: Record<string, unknown>
    footerComponent?: unknown
    footerProps?: Record<string, unknown>
    modal?: boolean
    closable?: boolean
    dismissableMask?: boolean
    styleClass?: string
    contentClass?: string
    headerClass?: string
    footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
    modal: true,
    closable: true,
    dismissableMask: true,
    styleClass: '',
    contentClass: 'bg-surface-50 h-full',
    headerClass: 'bg-surface-50',
    footerClass: 'bg-surface-50'
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'hide'): void
    (e: 'show'): void
}>()

function onHide(): void {
    emit('update:modelValue', false)
    emit('hide')
}

function onShow(): void {
    emit('show')
}
import { computed } from 'vue'

const rootClass = computed(() => `rounded-2xl overflow-hidden ${props.styleClass}`.trim())
</script>

<template>
    <Dialog
        :draggable="false"
        :visible="modelValue"
        :modal="props.modal"
        :closable="props.closable"
        :dismissable-mask="props.dismissableMask"
        :pt="{
            root: { class: rootClass },
            content: { class: contentClass },
            header: { class: headerClass },
            footer: { class: footerClass }
        }"
        @update:visible="(v: boolean) => emit('update:modelValue', v)"
        @hide="onHide"
        @show="onShow"
    >
        <template #header>
            <slot name="header">
                <component :is="headerComponent" v-if="headerComponent" v-bind="headerProps" />
            </slot>
        </template>

        <slot />

        <template #footer>
            <slot name="footer">
                <component :is="footerComponent" v-if="footerComponent" v-bind="footerProps" />
            </slot>
        </template>
    </Dialog>
</template>
<style scoped></style>
