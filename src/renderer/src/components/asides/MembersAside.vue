<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MembersList from '../members/MembersList.vue'

const { t } = useI18n()
</script>

<template>
  <aside class="w-64 min-w-64 h-full bg-surface-200 rounded-r-xl overflow-hidden">
    <div class="h-full flex flex-col">
      <div class="px-3 py-2 text-sm font-semibold text-surface-800 border-b border-surface-300">
        {{ t('userInterface.membersAside.title') }}
      </div>
      <div class="flex-1 overflow-y-auto">
        <MembersList />
      </div>
    </div>
  </aside>
</template>
