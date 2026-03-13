<template>
  <div
    class="local-db-feedback"
    :class="[
      `is-${state}`,
      { 'is-framed': framed, 'is-compact': compact },
    ]"
    :role="state === 'error' ? 'alert' : 'status'"
  >
    <div class="local-db-feedback__icon-shell">
      <span class="local-db-feedback__icon">
        <i
          :class="resolvedIcon"
          aria-hidden="true"
        />
      </span>
      <span
        v-if="state === 'loading'"
        class="spinner-border spinner-border-sm local-db-feedback__spinner"
        aria-hidden="true"
      />
    </div>

    <div class="local-db-feedback__body">
      <div class="local-db-feedback__eyebrow">
        {{ resolvedEyebrow }}
      </div>
      <h2 class="local-db-feedback__title">
        {{ title }}
      </h2>
      <p class="local-db-feedback__description">
        {{ description }}
      </p>
      <p
        v-if="note"
        class="local-db-feedback__note"
      >
        {{ note }}
      </p>

      <div
        v-if="hasActions"
        class="local-db-feedback__actions"
      >
        <slot name="actions">
          <button
            v-if="actionLabel"
            class="btn btn-primary"
            type="button"
            @click="emit('action')"
          >
            {{ actionLabel }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

type LocalDbFeedbackState = 'loading' | 'empty' | 'error';

const props = withDefaults(defineProps<{
  state: LocalDbFeedbackState;
  title: string;
  description: string;
  note?: string | null;
  eyebrow?: string | null;
  icon?: string | null;
  actionLabel?: string | null;
  framed?: boolean;
  compact?: boolean;
}>(), {
  note: null,
  eyebrow: null,
  icon: null,
  actionLabel: null,
  framed: true,
  compact: false,
});

defineSlots<{
  actions?: () => any;
}>();

const emit = defineEmits<{
  action: [];
}>();

const slots = useSlots();

const resolvedEyebrow = computed(() => {
  if (props.eyebrow) {
    return props.eyebrow;
  }

  switch (props.state) {
    case 'loading':
      return 'Sinkronisasi DB Lokal';
    case 'error':
      return 'Akses DB Lokal';
    default:
      return 'Data';
  }
});

const resolvedIcon = computed(() => {
  if (props.icon) {
    return props.icon;
  }

  switch (props.state) {
    case 'loading':
      return 'bi bi-database-fill-gear';
    case 'error':
      return 'bi bi-exclamation-octagon';
    default:
      return 'bi bi-inbox';
  }
});

const hasActions = computed(() => Boolean(slots.actions || props.actionLabel));
</script>

<style scoped src="@core/presentation/styles/local_db_feedback_state.css"></style>
