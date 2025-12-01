<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

interface Props {
    buttonLabel?: string
    buttonIcon?: string
    buttonClass?: string
    buttonVariant?: string
    buttonRounded?: boolean
    buttonAriaLabel?: string
    popoverClass?: string
    buttonBadge?: string
    buttonBadgeSeverity?: string
}

interface PopoverRef {
    isVisible?: boolean
    hide?: () => void
    toggle?: (event?: Event) => void
}

const props = withDefaults(defineProps<Props>(), {
    buttonLabel: '',
    buttonIcon: '',
    buttonClass: '',
    buttonVariant: 'text',
    buttonAriaLabel: '',
    popoverClass: '',
    buttonBadge: undefined,
    buttonBadgeSeverity: 'danger'
})

const emit = defineEmits<{ (e: 'toggle', value: boolean): void }>()

const popoverRef = ref<PopoverRef | null>(null)

const buttonLabelText = computed(() => {
    if (props.buttonLabel && te(props.buttonLabel)) return t(props.buttonLabel) as string
    return props.buttonLabel || ''
})

const buttonAriaLabelComputed = computed(() => {
    if (props.buttonAriaLabel && te(props.buttonAriaLabel))
        return t(props.buttonAriaLabel) as string
    if (props.buttonAriaLabel) return props.buttonAriaLabel
    return buttonLabelText.value || ''
})

function togglePopover(event: Event): void {
    event.stopPropagation()

    if (popoverRef.value?.isVisible) {
        popoverRef.value.hide?.()
    } else {
        popoverRef.value?.toggle?.(event)
    }

    const isVisible = !!popoverRef.value?.isVisible
    emit('toggle', isVisible)
}

function hidePopover(): void {
    popoverRef.value?.hide?.()
}

defineExpose({
    hidePopover,
    popoverRef
})
</script>

<template>
    <div class="generic-popover">
        <slot name="trigger" :toggle="togglePopover" :props="props">
            <Button
                :label="buttonLabelText"
                :icon="props.buttonIcon"
                :class="props.buttonClass"
                :variant="props.buttonVariant"
                :rounded="props.buttonRounded"
                :aria-label="buttonAriaLabelComputed"
                @click="togglePopover"
            >
                <slot name="button"></slot>
            </Button>
            <span
                v-if="props.buttonBadge"
                class="p-badge p-component p-badge-circle"
                :class="[
                    props.buttonBadgeSeverity ? `p-badge-${props.buttonBadgeSeverity}` : '',
                    'custom-badge-position'
                ]"
            >
                {{ props.buttonBadge }}
            </span>
        </slot>

        <Popover ref="popoverRef" :class="props.popoverClass">
            <div class="popover-content">
                <slot name="content"></slot>
            </div>
        </Popover>
    </div>
</template>

<style scoped>
.generic-popover {
    display: inline-flex;
    position: relative;
}

.custom-badge-position {
    position: absolute;
    top: 0.1rem;
    right: -0.15rem;
    min-width: 1rem;
    height: 1rem;
    line-height: 1rem;
    padding: 0;
    margin: 0;
    font-size: 0.75rem;
    z-index: 1;
}

.popover-content {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background-color: var(--p-surface-0);
    border-radius: 0.5rem;
    box-shadow: var(--p-shadow-2);
}

</style>
