<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppDialog from '@/components/common/dialogs/AppDialog.vue'
import Card from 'primevue/card'
import Select from 'primevue/select'
import { ref, computed, watch } from 'vue'
import type {
    IWidgetComponent,
    ISelectOption
} from '@shared/contracts/interfaces/widget.interfaces'

const props = defineProps<{
    visible: boolean
    availableWidgets: IWidgetComponent[]
    categoryOptions: ISelectOption[]
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'select', widgetId: string): void
}>()

const { t } = useI18n()
const selectedCategory = ref<string | null>(null)

// Initialize default category when dialog opens
watch(
    () => props.visible,
    (visible) => {
        if (visible && !selectedCategory.value) {
            selectedCategory.value = props.categoryOptions[0]?.value ?? null
        }
    }
)

const filteredWidgets = computed(() => {
    if (!selectedCategory.value) return props.availableWidgets
    return props.availableWidgets.filter((w) => w.metadata.category.key === selectedCategory.value)
})
</script>

<template>
    <AppDialog
        :model-value="visible"
        :dismissable-mask="false"
        style-class="max-w-[50rem] w-full max-h-[80vh] overflow-hidden h-full"
        @update:model-value="emit('update:visible', $event)"
    >
        <template #header>
            <h2 class="text-xl font-semibold">{{ t('common.widgets.select_widget') }}</h2>
        </template>

        <div class="p-4 space-y-4">
            <!-- Category selector -->
            <div class="flex items-center justify-between mb-2">
                <div>
                    <label class="font-medium mr-2"> {{ t('common.widgets.category') }} : </label>
                    <Select
                        v-model="selectedCategory"
                        :options="categoryOptions"
                        option-label="label"
                        option-value="value"
                        :placeholder="t('common.widgets.select_category')"
                        class="min-w-[200px]"
                    />
                </div>

                <span class="text-xs text-surface-500">
                    {{ filteredWidgets.length }} {{ t('common.widgets.available') }}
                </span>
            </div>

            <!-- Widgets list -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-2">
                <Card
                    v-for="widget in filteredWidgets"
                    :key="widget.id"
                    class="cursor-pointer hover:shadow-lg transition-shadow"
                    @click="emit('select', widget.id)"
                >
                    <template #header>
                        <div class="flex items-center gap-3 p-4">
                            <i
                                v-if="widget.metadata.icon"
                                :class="widget.metadata.icon"
                                class="text-2xl text-primary-500"
                            ></i>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold">
                                    {{ widget.metadata.title }}
                                </h3>
                                <p
                                    v-if="widget.metadata.description"
                                    class="text-sm text-surface-500 mt-1"
                                >
                                    {{ widget.metadata.description }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <div
                            class="flex items-center justify-between px-4 pb-3 text-xs text-surface-400"
                        >
                            <span class="font-medium capitalize">
                                {{ widget.metadata.category.label }}
                            </span>
                            <span>
                                {{ widget.metadata.defaultSize.w }}x{{
                                    widget.metadata.defaultSize.h
                                }}
                            </span>
                        </div>
                    </template>
                </Card>

                <div
                    v-if="filteredWidgets.length === 0"
                    class="col-span-full text-center py-8 text-surface-500"
                >
                    {{ t('common.widgets.no_available') }}
                </div>
            </div>
        </div>
    </AppDialog>
</template>
