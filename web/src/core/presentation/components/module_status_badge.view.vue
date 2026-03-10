<template>
  <span class="status-badge" :class="statusClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AppModuleStatus } from '@core/domain/interfaces/app_module.interface';

const props = defineProps<{
  status: AppModuleStatus;
}>();

const labelMap: Record<AppModuleStatus, string> = {
  foundation_ready: 'Foundation Ready',
  in_progress: 'In Progress',
  planned: 'Planned'
};

const label = computed(() => labelMap[props.status]);

const statusClass = computed(() => ({
  'is-ready': props.status === 'foundation_ready',
  'is-progress': props.status === 'in_progress',
  'is-planned': props.status === 'planned'
}));
</script>
