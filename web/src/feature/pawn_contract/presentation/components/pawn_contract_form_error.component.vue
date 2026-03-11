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

<style scoped src="@feature/pawn_contract/presentation/styles/pawn_contract_form_error.css"></style>
