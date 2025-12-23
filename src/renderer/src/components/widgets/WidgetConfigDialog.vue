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
    [EWidgetCategory.Activity]: defineAsyncComponent(() => import('./ActivityWidgetConfig.vue'))
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

function handleSave() {
    emit('save', config.value)
    emit('update:visible', false)
}

function handleCancel() {
    emit('cancel')
    emit('update:visible', false)
}
</script>

<template>
    <AppDialog
        :model-value="visible"
        :header-props="{
            title: t('common.widgets.configure_widget'),
            subtitle: widget?.metadata?.title ?? ''
        }"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <div v-if="widget" class="flex flex-col">
                <h3 class="text-lg font-semibold">{{ t('common.widgets.configure_widget') }}</h3>
                <div class="flex items-center gap-2 mt-1">
                    <i :class="widget.metadata.icon" class="text-primary-500"></i>
                    <span class="text-surface-700 font-medium">{{ widget.metadata.title }}</span>
                </div>
                <p class="text-sm text-surface-500 mt-1">{{ widget.metadata.description }}</p>
            </div>
        </template>

        <div class="p-4">
            <div v-if="configComponent" class="config-form">
                <component :is="configComponent" v-model="config" />
            </div>
            <div v-else class="text-surface-500 italic">
                {{ t('common.widgets.no_config_available') }}
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2 p-4">
                <Button
                    :label="t('common.cancel')"
                    icon="pi pi-times"
                    text
                    severity="secondary"
                    @click="handleCancel"
                />
                <Button
                    :label="t('common.save')"
                    icon="pi pi-check"
                    severity="primary"
                    :loading="isLoading"
                    @click="handleSave"
                />
            </div>
        </template>
    </AppDialog>
</template>
