<template>
  <RouterView v-if="route.meta.publicAuth" />
  <AppShell v-else />
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppShell from '@core/presentation/components/app_shell.view.vue';

const route = useRoute();
</script>
