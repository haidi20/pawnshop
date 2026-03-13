<template>
  <div v-if="isOpen">
    <div
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        :class="modalSizeClass"
      >
        <div class="modal-content border-0 shadow">
          <slot />
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade show"
      @click="emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch, computed } from 'vue';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>(), {
  size: 'md'
});

const emit = defineEmits<{
  close: [];
}>();

const modalSizeClass = computed(() => {
  if (props.size === 'md') return '';
  return `modal-${props.size}`;
});

const syncBodyScrollLock = (value: boolean): void => {
  if (typeof document === 'undefined') {
    return;
  }
  document.body.classList.toggle('modal-open', value);
};

watch(
  () => props.isOpen,
  (value) => {
    syncBodyScrollLock(value);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  syncBodyScrollLock(false);
});
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.1);
}
</style>
