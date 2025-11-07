<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true
  }
})

const menuRef = ref(null)

// Expose the menuRef to parent components
defineExpose({ menu: menuRef })

const emit = defineEmits(['itemSelected'])

const handleItemClick = (item: unknown): void => {
  emit('itemSelected', item)
}
</script>

<template>
  <ContextMenu ref="menuRef" :model="items">
    <template #item="{ item, props }">
      <a
        v-ripple
        :class="(item.danger ? 'danger' : '') + ' ripple'"
        v-bind="props.action"
        @click="handleItemClick(item)"
      >
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
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
