<script setup lang="ts">
interface ServerAction {
  id: string
  label: string
  icon?: string
  routeName?: string
  description?: string
}

const actions: ServerAction[] = [
  { id: 'stats', label: 'Statistiques', icon: 'pi pi-chart-line', routeName: 'ServerStats' },
  { id: 'widgets', label: 'Widgets', icon: 'pi pi-th-large', routeName: 'ServerWidgets' },
  { id: 'settings', label: 'Paramètres', icon: 'pi pi-cog', routeName: 'ServerSettings' },
  { id: 'invites', label: 'Invitations', icon: 'pi pi-link', routeName: 'ServerInvites' }
]

const emit = defineEmits<{ (e: 'action-click', action: ServerAction): void }>()

function onClick(action: ServerAction): void {
  emit('action-click', action)
}
</script>
<template>
  <div class="flex flex-col items-start gap-1 w-full h-full bg-surface-100 rounded-l-2xl p-2">
    <button
      v-for="a in actions"
      :key="a.id"
      type="button"
      class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-200 text-left"
      @click="onClick(a)"
    >
      <i v-if="a.icon" :class="a.icon" class="text-surface-600"></i>
      <span class="text-sm text-surface-900">{{ a.label }}</span>
    </button>
  </div>
</template>
