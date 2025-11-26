<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';

const props = defineProps({
  // Button props
  buttonLabel: {
    type: String,
    default: ''
  },
  buttonIcon: {
    type: String,
    default: ''
  },
  buttonClass: {
    type: String,
    default: ''
  },
  buttonVariant: {
    type: String,
    default: 'text'
  },
  buttonRounded: {
    type: Boolean,
    default: false
  },
  buttonAriaLabel: {
    type: String,
    default: ''
  },
  // Popover props
  popoverClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['toggle']);

const popoverRef = ref(null);

function togglePopover(event: Event) {
  event.stopPropagation();
  
  if (popoverRef.value.isVisible) {
    popoverRef.value.hide();
  } else {
    popoverRef.value.toggle(event);
  }
  
  emit('toggle', popoverRef.value.isVisible);
}

// Method to hide popover programmatically
function hidePopover() {
  if (popoverRef.value) {
    popoverRef.value.hide();
  }
}

// Expose methods to parent components
defineExpose({
  hidePopover,
  popoverRef
});
</script>

<template>
  <div class="generic-popover">
    <!-- Trigger Button -->
    <Button
      :label="buttonLabel"
      :icon="buttonIcon"
      :class="buttonClass"
      :variant="buttonVariant"
      :rounded="buttonRounded"
      :aria-label="buttonAriaLabel"
      @click="togglePopover"
    >
      <!-- Button content slot -->
      <slot name="button"></slot>
    </Button>

    <!-- Popover -->
    <Popover ref="popoverRef" :class="popoverClass">
      <div class="popover-content">
        <!-- Popover content slot -->
        <slot name="content"></slot>
      </div>
    </Popover>
  </div>
</template>

<style scoped>
.generic-popover {
  display: inline-flex;
}

.popover-content {
  display: flex;
  flex-direction: column;
}
</style>
