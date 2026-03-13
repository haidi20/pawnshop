<template>
  <div v-if="isOpen">
    <div class="modal fade show d-block pawn-contract-create-page__confirm-modal" tabindex="-1" role="dialog"
      aria-modal="true" @click.self="emit('close')">
      <div
        class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl pawn-contract-create-page__confirm-dialog">
        <div class="modal-content pawn-contract-create-page__confirm-content border-0">
          <div class="modal-header pawn-contract-create-page__confirm-header">
            <div>
              <div class="pawn-contract-create-page__section-kicker">
                Konfirmasi
              </div>
              <h1 class="modal-title h5 mb-1">
                Periksa ringkasan gadai
              </h1>
              <p class="text-muted mb-0">
                Pastikan seluruh data tab 1 sudah benar sebelum lanjut ke data nasabah.
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Close" @click="emit('close')" />
          </div>

          <div class="modal-body" data-testid="pawn-contract-step-confirmation">
            <div class="pawn-contract-form-confirmation text-start">
              <section v-for="section in sections" :key="section.id" class="pawn-contract-create-page__confirm-panel"
                :data-testid="`pawn-contract-step-section-${section.id}`">
                <div class="pawn-contract-create-page__confirm-panel-head">
                  <div class="pawn-contract-create-page__confirm-panel-icon">
                    <i :class="section.iconClass" aria-hidden="true" />
                  </div>
                  <div class="pawn-contract-create-page__confirm-panel-copy">
                    <div class="pawn-contract-create-page__section-kicker">
                      {{ section.kicker }}
                    </div>
                    <h2 class="pawn-contract-create-page__sidebar-title">
                      {{ section.title }}
                    </h2>
                    <p class="text-muted mb-0">
                      {{ section.description }}
                    </p>
                  </div>
                </div>

                <div class="pawn-contract-create-page__summary-list mt-4">
                  <div v-for="row in section.rows" :key="row.key" class="pawn-contract-create-page__summary-item"
                    :data-testid="`pawn-contract-step-row-${section.id}-${row.key}`">
                    <div class="pawn-contract-create-page__summary-item-copy">
                      <span>{{ row.label }}</span>
                      <small v-if="row.helper" class="pawn-contract-create-page__summary-item-helper">{{ row.helper
                        }}</small>
                    </div>
                    <strong :class="row.valueClassName">{{ row.value }}</strong>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="modal-footer pawn-contract-create-page__confirm-footer">
            <button type="button" class="btn btn-outline-secondary" @click="emit('close')">
              Periksa lagi
            </button>
            <button type="button" class="btn btn-primary" @click="emit('confirm')">
              Lanjut ke data nasabah
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show pawn-contract-create-page__confirm-backdrop" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import type { PawnContractConfirmationSectionModel } from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';

interface PawnContractFormStepConfirmationProps {
  isOpen: boolean;
  sections: PawnContractConfirmationSectionModel[];
}

const props = defineProps<PawnContractFormStepConfirmationProps>();
const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const isOpen = computed<boolean>(() => props.isOpen);
const sections = computed<ReadonlyArray<PawnContractConfirmationSectionModel>>(() => props.sections);

const syncBodyScrollLock = (value: boolean): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('modal-open', value);
};

watch(isOpen, (value: boolean) => {
  syncBodyScrollLock(value);
}, { immediate: true });

onBeforeUnmount(() => {
  syncBodyScrollLock(false);
});
</script>

<style scoped>
.pawn-contract-form-confirmation {
  display: grid;
  gap: 1rem;
}
</style>
