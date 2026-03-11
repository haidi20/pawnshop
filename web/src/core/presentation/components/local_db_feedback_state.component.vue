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
      return 'Data Lokal';
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

<style scoped>
.local-db-feedback {
  --local-db-feedback-accent: #0d6efd;
  --local-db-feedback-soft: rgba(13, 110, 253, 0.12);
  --local-db-feedback-border: rgba(13, 110, 253, 0.14);
  --local-db-feedback-title: #1f2937;
  --local-db-feedback-copy: #52607a;
  --local-db-feedback-note: #6b7a93;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.local-db-feedback.is-loading {
  --local-db-feedback-accent: #0d6efd;
  --local-db-feedback-soft: rgba(13, 110, 253, 0.12);
  --local-db-feedback-border: rgba(13, 110, 253, 0.16);
}

.local-db-feedback.is-empty {
  --local-db-feedback-accent: #0f766e;
  --local-db-feedback-soft: rgba(15, 118, 110, 0.1);
  --local-db-feedback-border: rgba(15, 118, 110, 0.16);
}

.local-db-feedback.is-error {
  --local-db-feedback-accent: #c2410c;
  --local-db-feedback-soft: rgba(194, 65, 12, 0.12);
  --local-db-feedback-border: rgba(194, 65, 12, 0.18);
}

.local-db-feedback.is-framed {
  padding: 1.25rem;
  border: 1px solid var(--local-db-feedback-border);
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 18px 40px -28px rgba(15, 23, 42, 0.28);
}

.local-db-feedback.is-compact {
  padding: 0;
  gap: 0.85rem;
}

.local-db-feedback__icon-shell {
  position: relative;
  flex: 0 0 auto;
}

.local-db-feedback__icon {
  width: 3.25rem;
  height: 3.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: var(--local-db-feedback-soft);
  color: var(--local-db-feedback-accent);
  font-size: 1.35rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.local-db-feedback.is-compact .local-db-feedback__icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
  font-size: 1.1rem;
}

.local-db-feedback__spinner {
  position: absolute;
  right: -0.1rem;
  bottom: -0.1rem;
  color: var(--local-db-feedback-accent);
  background: #fff;
  border-radius: 999px;
}

.local-db-feedback__body {
  min-width: 0;
}

.local-db-feedback__eyebrow {
  margin-bottom: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--local-db-feedback-accent);
}

.local-db-feedback__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--local-db-feedback-title);
}

.local-db-feedback.is-compact .local-db-feedback__title {
  font-size: 0.98rem;
}

.local-db-feedback__description,
.local-db-feedback__note {
  margin: 0.45rem 0 0;
  line-height: 1.6;
}

.local-db-feedback__description {
  color: var(--local-db-feedback-copy);
}

.local-db-feedback__note {
  color: var(--local-db-feedback-note);
}

.local-db-feedback__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .local-db-feedback.is-framed {
    padding: 1rem;
  }
}
</style>
