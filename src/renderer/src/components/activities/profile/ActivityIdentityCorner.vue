<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useServerStore } from '@/stores/server'
import { useActivityCRUD } from '@/composables/activities/useActivityCRUD'

const server_store = useServerStore()
const { getActivityById } = useActivityCRUD()

const props = withDefaults(
    defineProps<{
        show?: boolean
        class?: string
        activityId?: string
    }>(),
    {
        show: true,
        class: 'top-4 right-4',
        activityId: undefined
    }
)

const localActivityName = ref<string | null>(null)

async function fetchActivityName(): Promise<void> {
    const serverId = server_store.getPublicId
    if (!props.activityId || !serverId) return

    try {
        const res = await getActivityById(serverId, props.activityId)
        if (res.data) {
            localActivityName.value = res.data.name
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    if (props.activityId) {
        void fetchActivityName()
    }
})

watch(
    () => props.activityId,
    (newId) => {
        if (newId) {
            void fetchActivityName()
        }
    }
)

const activityName = computed(() => localActivityName.value)
const isVisible = computed(() => props.show)
</script>

<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
    >
        <div v-if="isVisible && activityName" class="absolute z-10" :class="props.class">
            <div
                class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-100/80 backdrop-blur-sm border border-surface-200/50 text-[10px] font-medium text-surface-500 hover:text-primary-500 hover:border-primary-200 transition-colors pointer-events-none"
            >
                <i class="pi pi-tag text-[9px]"></i>
                <span class="max-w-[80px] truncate uppercase tracking-wider">{{
                    activityName
                }}</span>
            </div>
        </div>
    </Transition>
</template>
