<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'
import EnumDefinitionFilterBar from '@/components/enum-definitions/EnumDefinitionFilterBar.vue'
import EnumDefinitionCardGrid from '@/components/enum-definitions/EnumDefinitionCardGrid.vue'
import EnumDefinitionCreateEditDialog from '@/components/enum-definitions/create-edit/EnumDefinitionCreateEditDialog.vue'
import { useEnumDefinitionCRUD } from '@/composables/enum-definitions/useEnumDefinitionCRUD'
import type { IEnumDefinition } from '@shared/contracts/interfaces/entities/enum-definition.interfaces'
import { useToast } from 'primevue/usetoast'

const { t } = useI18n()
const server_store = useServerStore()
const toast = useToast()
const { listEnumDefinitions } = useEnumDefinitionCRUD()

// Filter state
const search_query = ref('')
const search_field = ref<'name' | 'description'>('name')
const sort_by = ref<'name' | 'choices_count'>('name')
const sort_order = ref<'asc' | 'desc'>('asc')

// Data state
const definitions = ref<IEnumDefinition[]>(server_store.getEnumsDefinition || [])
const loading = ref(false)
const showCreateDialog = ref(false)

const MAX_VALUES_PER_CHUNK = 5

function countChoices(def: IEnumDefinition): number {
    if (!def.values?.length) return 0
    let count = 0
    def.values.forEach((valueObj) => {
        for (let i = 1; i <= MAX_VALUES_PER_CHUNK; i++) {
            const key = `value${i}` as keyof typeof valueObj
            const val = valueObj[key]
            if (typeof val === 'string' && val.trim()) {
                count++
            }
        }
    })
    return count
}

const filteredDefinitions = computed(() => {
    let result = [...definitions.value]

    // Filter by search query based on selected field
    if (search_query.value) {
        const query = search_query.value.toLowerCase()
        result = result.filter((d) => {
            if (search_field.value === 'name') {
                return d.name.toLowerCase().includes(query)
            } else {
                return (d.description || '').toLowerCase().includes(query)
            }
        })
    }

    // Sort results
    result.sort((a, b) => {
        let comparison = 0
        switch (sort_by.value) {
            case 'name':
                comparison = a.name.localeCompare(b.name)
                break
            case 'choices_count':
                comparison = countChoices(a) - countChoices(b)
                break
        }
        return sort_order.value === 'asc' ? comparison : -comparison
    })

    return result
})

async function loadDefinitions(): Promise<void> {
    if (!server_store.getPublicId) return
    loading.value = true
    try {
        const [defsRes] = await Promise.all([listEnumDefinitions(server_store.getPublicId)])

        if (defsRes.data) {
            definitions.value = defsRes.data
            server_store.setEnumsDefinition(defsRes.data)
        }
    } catch (e) {
        console.error(e)
        toast.add({
            severity: 'error',
            summary: t('messages.error.fetch'),
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

function onAddDefinition(): void {
    showCreateDialog.value = true
}

onMounted(() => {
    if (!server_store.getEnumsDefinition) {
        loadDefinitions()
    }
})
</script>

<template>
    <div class="flex flex-col items-center justify-start w-full h-full">
        <div class="flex flex-row items-center justify-between w-full h-12 p-2">
            <h2 class="text-2xl font-bold">
                {{ t('views.server_enum_definitions.title') }}
            </h2>
            <div class="flex flex-row items-center justify-center">
                <Button
                    icon="pi pi-plus"
                    :label="t('views.server_enum_definitions.add_definition')"
                    severity="primary"
                    size="small"
                    @click="onAddDefinition"
                />
            </div>
        </div>

        <div class="w-full px-2 pb-2">
            <EnumDefinitionFilterBar
                :search="search_query"
                :search-field="search_field"
                :sort-by="sort_by"
                :sort-order="sort_order"
                :count="filteredDefinitions.length"
                @update:search="(v) => (search_query = v)"
                @update:search-field="(v) => (search_field = v)"
                @update:sort-by="(v) => (sort_by = v)"
                @update:sort-order="(v) => (sort_order = v)"
            />
        </div>

        <div class="flex-1 w-full px-2 pb-2 overflow-hidden">
            <EnumDefinitionCardGrid
                :definitions="filteredDefinitions"
                :loading="loading"
                @refresh="loadDefinitions"
            />
        </div>

        <EnumDefinitionCreateEditDialog
            v-model="showCreateDialog"
            @created="loadDefinitions"
            @updated="loadDefinitions"
        />
    </div>
</template>
