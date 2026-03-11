<template>
  <section
    class="card p-4 p-lg-5 pawn-contract-form-loading-state"
    aria-busy="true"
  >
    <div class="pawn-contract-form-loading-state__head">
      <div class="pawn-contract-form-loading-state__icon">
        <i
          class="bi bi-hourglass-split pawn-contract-form-loading-state__icon-symbol"
          aria-hidden="true"
        />
      </div>
      <div class="pawn-contract-form-loading-state__copy">
        <div class="fw-bold">
          {{ loadingTitle }}
        </div>
        <div class="text-secondary">
          {{ loadingDescription }}
        </div>
      </div>
    </div>

    <div class="pawn-contract-form-loading-state__preview mt-4">
      <div class="pawn-contract-form-loading-state__grid">
        <div class="pawn-contract-form-loading-state__chip" />
        <div class="pawn-contract-form-loading-state__chip" />
      </div>

      <div class="pawn-contract-form-loading-state__card">
        <div class="pawn-contract-form-loading-state__line is-short" />
        <div class="pawn-contract-form-loading-state__line" />
        <div class="pawn-contract-form-loading-state__line" />
        <div class="pawn-contract-form-loading-state__line is-medium" />
      </div>

      <div class="pawn-contract-form-loading-state__grid">
        <div class="pawn-contract-form-loading-state__card">
          <div class="pawn-contract-form-loading-state__line is-short" />
          <div class="pawn-contract-form-loading-state__line" />
          <div class="pawn-contract-form-loading-state__line is-medium" />
        </div>
        <div class="pawn-contract-form-loading-state__card">
          <div class="pawn-contract-form-loading-state__line is-short" />
          <div class="pawn-contract-form-loading-state__line" />
          <div class="pawn-contract-form-loading-state__line is-medium" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface PawnContractFormLoadingProps {
  title: string;
  description?: string;
}

const props = withDefaults(
  defineProps<PawnContractFormLoadingProps>(),
  {
    description: 'Menyiapkan data cabang, nasabah, barang, dan hitungan biaya.'
  }
);
const loadingTitle: string = props.title;
const loadingDescription: string = props.description;
</script>

<style scoped src="@feature/pawn_contract/presentation/styles/pawn_contract_form_loading.css"></style>
