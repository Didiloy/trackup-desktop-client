<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AvatarButton from '@/components/common/AvatarButton.vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { useServerStore } from '@/stores/server'

const i18n = useI18n()

const user_store = useUserStore()
const server_store = useServerStore()

const route = useRoute()
const router = useRouter()

const isActive = computed(() => route.path === '/')

const goHome = async (): Promise<void> => {
    server_store.resetState()
    await router.push({ name: 'Home' })
}
</script>

<template>
    <AvatarButton
        id="ProfileButton"
        :image-url="user_store.getAvatar"
        :label="i18n.t('userInterface.userProfileMenu.title')"
        size="normal"
        shape="rounded"
        hover-scale
        :title="user_store.getUsername"
        :disabled="$route.fullPath === '/'"
        :button-class="'profile-rainbow'"
        :class="{ 'is-active': isActive }"
        @click="goHome"
    />
</template>

<style scoped>
.profile-rainbow {
    /* Match AvatarButton outer rounding visually */
    border-radius: 1rem; /* close to rounded-2xl */
    padding: 1.5px;
}

.profile-rainbow.is-active {
    --border-angle: 0deg;
    animation: border-angle-rotate 3s infinite linear;
    background: conic-gradient(from var(--border-angle), #4a84ff, #8a5cf7, #d46eff, #4a84ff);
}

@keyframes border-angle-rotate {
    from {
        --border-angle: 0deg;
    }
    to {
        --border-angle: 360deg;
    }
}

/* Register custom property for smoother animation (supported browsers) */
@property --border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
}
</style>
