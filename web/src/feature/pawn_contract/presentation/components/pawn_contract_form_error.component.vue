<template>
  <section class="card p-4 p-lg-5 pawn-contract-form-error-state">
    <div class="pawn-contract-form-error-state__head">
      <div class="pawn-contract-form-error-state__icon">
        <i
          class="bi bi-exclamation-octagon-fill pawn-contract-form-error-state__icon-symbol"
          aria-hidden="true"
        />
      </div>
      <div class="pawn-contract-form-error-state__copy">
        <div class="fw-bold text-danger mb-1">
          {{ errorTitle }}
        </div>
        <p class="mb-0 text-secondary">
          {{ errorDescription }}
        </p>
      </div>
    </div>

    <div class="pawn-contract-form-error-state__message mt-4">
      <div class="pawn-contract-form-error-state__label">
        Pesan error
      </div>
      <p class="mb-0">
        {{ message }}
      </p>
    </div>

    <button
      class="btn btn-primary mt-4 align-self-start"
      type="button"
      @click="$emit('retry')"
    >
      <i
        class="bi bi-arrow-clockwise me-2"
        aria-hidden="true"
      />
      {{ retryLabelText }}
    </button>
  </section>
</template>

<script setup lang="ts">
interface PawnContractFormErrorProps {
  message: string;
  title?: string;
  description?: string;
  retryLabel?: string;
}

const props = withDefaults(
  defineProps<PawnContractFormErrorProps>(),
  {
    title: 'Form gagal dimuat',
    description:
      'Beberapa data referensi belum berhasil dibaca dari penyimpanan lokal. Periksa lagi detail error di bawah ini, lalu coba muat ulang formulir.',
    retryLabel: 'Coba lagi'
  }
);

const message: string = props.message;
const errorTitle: string = props.title;
const errorDescription: string = props.description;
const retryLabelText: string = props.retryLabel;

defineEmits<{
  retry: [];
}>();
</script>

<style scoped>
.pawn-contract-form-error-state {
  display: grid;
  gap: 18px;
  border: 1px solid rgba(0, 94, 170, 0.1);
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(220, 53, 69, 0.08), transparent 28%),
    #ffffff;
}

.pawn-contract-form-error-state__head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.pawn-contract-form-error-state__copy {
  display: grid;
  gap: 4px;
}

.pawn-contract-form-error-state__icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
}

.pawn-contract-form-error-state__icon-symbol {
  font-size: 1.4rem;
}

.pawn-contract-form-error-state__message {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(220, 53, 69, 0.16);
  background: rgba(220, 53, 69, 0.05);
}

.pawn-contract-form-error-state__label {
  margin-bottom: 8px;
  color: #dc3545;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (max-width: 575.98px) {
  .pawn-contract-form-error-state__head {
    flex-direction: column;
  }
}
</style>
