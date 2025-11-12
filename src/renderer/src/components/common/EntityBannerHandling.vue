<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Props {
    banner?: string
    entityName?: string
    displayEditButton?: boolean
}

interface Emits {
    (e: 'update-banner', banner: string): void
}

const props = withDefaults(defineProps<Props>(), {
    banner: '',
    entityName: '',
    displayEditButton: true
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const file_input = ref<HTMLInputElement>()
const banner_url = ref('')

// Sync external value into URL field when it is a plain URL (not data URL)
watch(
    () => props.banner,
    (newBanner) => {
        if (newBanner && !newBanner.startsWith('data:')) {
            banner_url.value = newBanner
        } else if (!newBanner) {
            banner_url.value = ''
        }
    },
    { immediate: true }
)

function triggerFileInput(): void {
    file_input.value?.click()
}

function onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            banner_url.value = ''
            emit('update-banner', reader.result as string)
        }
        reader.onerror = (error) => console.error('Error reading file:', error)
    }
}

function onUrlChange(): void {
    const url = banner_url.value.trim()
    if (url) {
        emit('update-banner', url)
        if (file_input.value) {
            file_input.value.value = ''
        }
    } else {
        emit('update-banner', '')
    }
}

function removeBanner(): void {
    banner_url.value = ''
    emit('update-banner', '')
    if (file_input.value) {
        file_input.value.value = ''
    }
}
</script>

<template>
    <div class="w-full flex flex-col gap-3">
        <!-- Banner preview -->
        <div
            class="relative w-full rounded-md overflow-hidden border border-surface-200 shadow-sm"
            style="height: 140px"
        >
            <img
                v-if="banner"
                :src="banner"
                :alt="entityName"
                class="w-full h-full object-cover not-draggable"
            />
            <div
                v-else
                class="w-full h-full flex items-center justify-center text-surface-500"
                style="background: var(--p-surface-100)"
            >
                <span class="text-sm">{{ entityName || 'Banner' }}</span>
            </div>

            <!-- Overlay action buttons -->
            <div
                v-if="displayEditButton"
                class="absolute top-2 right-2 flex items-center gap-2 z-10"
            >
                <Button
                    v-if="banner"
                    rounded
                    text
                    severity="danger"
                    size="small"
                    class="text-surface-500 hover:text-red-500 transition-all hover:scale-110"
                    :pt="{ root: { class: '!w-7 !h-7 !min-w-0 !p-0' } }"
                    @click="removeBanner"
                >
                    <FontAwesomeIcon icon="fa-solid fa-times" class="text-xs" />
                </Button>
            </div>
        </div>

        <!-- Controls -->
        <div v-if="displayEditButton" class="flex items-center gap-3">
            <input
                ref="file_input"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
            />
            <Button
                :pt="{ root: { class: 'shrink-0', style: 'color: var(--p-surface-100)' } }"
                @click="triggerFileInput"
            >
                <FontAwesomeIcon icon="fa-solid fa-upload" class="mr-1" />
                {{ t('common.choose') }}
            </Button>
            <span class="text-sm text-surface-500">{{ t('common.or') }}</span>
            <InputText
                v-model="banner_url"
                placeholder="https://example.com/banner.png"
                class="flex-1"
                :pt="{
                    root: {
                        style: 'background-color: var(--p-surface-100); color: var(--p-surface-900)'
                    }
                }"
                @blur="onUrlChange"
                @keyup.enter="onUrlChange"
            />
        </div>
    </div>
</template>
