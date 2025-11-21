<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const activityId = route.params.activityId as string
</script>

<template>
    <div>
        <h1>Activity {{ activityId }}</h1>
    </div>
</template>
