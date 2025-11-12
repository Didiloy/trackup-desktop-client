<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AvatarButton from '@/components/common/AvatarButton.vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const user_store = useUserStore()

const route = useRoute()
const router = useRouter()

const isActive = computed(() => route.path === '/')

const goHome = (): void => {
    router.push({ name: 'Home' })
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
    background: conic-gradient(
        from var(--border-angle),
        oklch(100% 0.37 0),
        oklch(100% 0.37 45),
        oklch(100% 0.37 90),
        oklch(100% 0.37 135),
        oklch(100% 0.37 180),
        oklch(100% 0.37 225),
        oklch(100% 0.37 270),
        oklch(100% 0.37 315),
        oklch(100% 0.37 360)
    );
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
