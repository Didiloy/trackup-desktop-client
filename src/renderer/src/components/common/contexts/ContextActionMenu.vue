<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

interface MenuItem {
    label?: string
    labelKey?: string
    labelParams?: Record<string, unknown>
    icon?: string
    danger?: boolean
    items?: MenuItem[]
    action?: Record<string, unknown>
}

const props = defineProps<{ items: MenuItem[] }>()

const menuRef = ref(null)

defineExpose({ menu: menuRef })

const emit = defineEmits<{ (e: 'itemSelected', item: MenuItem): void }>()

const handleItemClick = (item: MenuItem): void => {
    emit('itemSelected', item)
}

const resolveLabel = (item?: MenuItem): string => {
    if (!item) return ''
    if (item.labelKey && te(item.labelKey)) return t(item.labelKey, item.labelParams || {}) as string
    if (typeof item.label === 'string') {
        if (te(item.label)) return t(item.label) as string
        return item.label
    }
    return ''
}
</script>

<template>
    <ContextMenu ref="menuRef" :model="props.items">
        <template #item="{ item, props: slotProps }">
            <a
                v-ripple
                :class="(item.danger ? 'danger' : '') + ' ripple'"
                v-bind="slotProps.action"
                @click="handleItemClick(item)"
            >
                <span :class="item.icon" />
                <span class="ml-2">{{ resolveLabel(item) }}</span>
                <i v-if="item.items" class="pi pi-angle-right ml-auto"></i>
            </a>
        </template>
    </ContextMenu>
</template>

<style scoped>
.ripple {
    display: flex;
    justify-content: start;
    align-items: center;
}

.danger {
    color: var(--p-red-500);
}
</style>
