<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Button from 'primevue/button'
import { IWidgetComponent } from '@shared/contracts/interfaces/widget.interfaces'
import { EWidgetCategory } from '@shared/contracts/enums/widget-category.enum'

const props = defineProps<{
    visible: boolean
    widget: IWidgetComponent | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'cancel'): void
    (e: 'save', config: any): void
}>()

const { t } = useI18n()
const isLoading = ref(false)
const config = ref<Record<string, any>>({})

// Map categories or specific widgets to their config components
const configComponents: Record<string, any> = {
    // Dynamic import for Activity Widget Config
    [EWidgetCategory.Activity]: defineAsyncComponent(
        () => import('../activity/ActivityWidgetConfigForm.vue')
    ),
    [EWidgetCategory.Member]: defineAsyncComponent(
        () => import('../member/MemberWidgetConfigForm.vue')
    ),
    [EWidgetCategory.MemberActivities]: defineAsyncComponent(
        () => import('../member-activity/MemberActivityWidgetConfigForm.vue')
    )
}

const configComponent = computed(() => {
    if (!props.widget) return null
    // First check if there's a specific config for this widget ID (future proofing)
    // Then check by category
    const category = props.widget.metadata.category.key
    return configComponents[category] || null
})

// Reset config when dialog opens
watch(
    () => props.visible,
    (val) => {
        if (val) {
            config.value = {}
        }
    }
)

function handleSave(): void {
    emit('save', config.value)
    emit('update:visible', false)
}

function handleCancel(): void {
    emit('cancel')
    emit('update:visible', false)
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        :style-class="'w-[600px] max-w-[92vw] rounded-xl select-none shadow-2 h-content'"
        :dismissable-mask="false"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <div v-if="widget" class="flex flex-col">
                <h3 class="text-lg font-semibold">{{ t('widgets.ui.configure_widget') }}</h3>
                <div class="flex items-center gap-2 mt-1">
                    <i :class="widget.metadata.icon" class="text-primary-500"></i>
                    <span class="text-surface-700 font-medium">{{
                        t(widget.metadata.title_key)
                    }}</span>
                </div>
                <p v-if="widget.metadata.description_key" class="text-sm text-surface-500 mt-1">
                    {{ t(widget.metadata.description_key) }}
                </p>
            </div>
        </template>

        <div class="p-4">
            <div v-if="configComponent" class="config-form">
                <component :is="configComponent" v-model="config" />
            </div>
            <div v-else class="text-surface-500 italic">
                {{ t('widgets.ui.no_config_available') }}
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2 p-4">
                <Button
                    :label="t('common.actions.cancel')"
                    icon="pi pi-times"
                    text
                    severity="secondary"
                    @click="handleCancel"
                />
                <Button
                    :label="t('common.actions.save')"
                    icon="pi pi-check"
                    severity="primary"
                    :loading="isLoading"
                    @click="handleSave"
                />
            </div>
        </template>
    </AppDialog>
</template>
