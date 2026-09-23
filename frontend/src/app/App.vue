<script setup>
import { RouterView, useRoute } from 'vue-router';
import AppLayout from './layouts/AppLayout.vue';
const route = useRoute();
</script>

<template>
  <RouterView v-if="route.meta.layout === 'dev'" />
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
