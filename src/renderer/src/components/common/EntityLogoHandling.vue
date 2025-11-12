<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getInitials } from '@/utils'

interface Props {
    logo?: string
    entityName?: string
    displayEditButton?: boolean
}

interface Emits {
    (e: 'update-logo', logo: string): void
}

const props = withDefaults(defineProps<Props>(), {
    logo: '',
    entityName: '',
    displayEditButton: true
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const file_input = ref<HTMLInputElement>()
const logo_url = ref('')

// Watch logo prop to update logo_url when logo changes externally
watch(
    () => props.logo,
    (newLogo) => {
        if (newLogo && !newLogo.startsWith('data:')) {
            logo_url.value = newLogo
        } else if (!newLogo) {
            logo_url.value = ''
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
            logo_url.value = '' // Clear URL when uploading file
            emit('update-logo', reader.result as string)
        }
        reader.onerror = (error) => console.error('Error reading file:', error)
    }
}

function onUrlChange(): void {
    const url = logo_url.value.trim()
    if (url) {
        emit('update-logo', url)
        if (file_input.value) {
            file_input.value.value = ''
        }
    } else {
        emit('update-logo', '')
    }
}

function removeLogo(): void {
    logo_url.value = ''
    emit('update-logo', '')
    if (file_input.value) {
        file_input.value.value = ''
    }
}
</script>

<template>
    <div class="w-full flex items-center gap-8">
        <!-- Avatar section on the left -->
        <div class="relative shrink-0" style="width: 80px; height: 80px">
            <Avatar
                v-if="logo"
                :image="logo"
                size="xlarge"
                shape="circle"
                class="w-20 h-20 object-cover border-3 border-white shadow-md"
            />

            <Avatar
                v-else
                :label="getInitials(entityName, { maxInitials: 2, mode: 'all' })"
                size="xlarge"
                shape="circle"
                class="w-20 h-20 border-3 border-white shadow-md text-2xl"
            />

            <!-- Bouton de suppression du logo -->
            <Button
                v-if="logo && displayEditButton"
                rounded
                text
                severity="danger"
                size="small"
                class="absolute -top-10 -left-1 text-surface-500 hover:text-red-500 transition-all hover:scale-110"
                :pt="{
                    root: {
                        class: '!w-6 !h-6 !min-w-0 !p-0'
                    }
                }"
                @click="removeLogo"
            >
                <FontAwesomeIcon icon="fa-solid fa-times" class="text-xs" />
            </Button>
        </div>

        <!-- Upload and URL input section on the right -->
        <div v-if="displayEditButton" class="flex-1 flex items-center gap-6">
            <input
                ref="file_input"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
            />

            <!-- Custom button to trigger file input -->
            <Button
                class="flex-1"
                :pt="{
                    root: {
                        class: 'w-full',
                        style: 'color: var(--p-surface-100)'
                    }
                }"
                @click="triggerFileInput"
            >
                <FontAwesomeIcon icon="fa-solid fa-upload" class="mr-1" />
                {{ t('common.choose') }}
            </Button>

            <span class="text-sm text-surface-500 shrink-0">{{ t('common.or') }}</span>

            <InputText
                v-model="logo_url"
                placeholder="https://example.com/logo.png"
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
