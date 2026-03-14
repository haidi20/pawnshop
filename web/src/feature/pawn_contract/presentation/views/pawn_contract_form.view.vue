<template>
  <PawnContractFormLoading
    v-if="isLoading"
    :title="loadingTitle"
  />

  <PawnContractFormError
    v-else-if="error"
    :message="error"
    @retry="vm.loadReferenceData()"
  />

  <section
    v-else-if="referenceData"
    class="pawn-contract-create-page"
    data-testid="pawn-contract-form-page"
  >
    <div class="row g-4 align-items-start">
      <div class="col-12">
        <div class="card border-0 bg-light-subtle">
          <div class="card-body py-3 px-4">
            <div class="form-check form-switch mb-0">
              <input id="stepOneAutoInsert" class="form-check-input" type="checkbox"
                :checked="isStepOneAutoInsertEnabled" @change="handleStepOneAutoInsertChange">
              <label class="form-check-label fw-semibold" for="stepOneAutoInsert">
                Auto insert data tab 1
              </label>
              <div class="form-text mt-1">
                Isi otomatis contoh data untuk tab detail gadai. Matikan kembali untuk mengembalikan data tab 1
                sebelumnya.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <section class="card pawn-contract-create-page__hero p-4 p-lg-5">
          <div class="row">
            <div class="col-md-6">
              <div class="pawn-contract-create-page__meta-chip">
                <span class="pawn-contract-create-page__meta-label">Nomor gadai</span>
                <strong>{{ form.contractNumber }}</strong>
              </div>
            </div>
            <div class="col-md-6">
              <div class="pawn-contract-create-page__meta-chip">
                <span class="pawn-contract-create-page__meta-label">Saldo cabang terpilih</span>
                <strong>{{ selectedBranch ? formatCurrency(selectedBranch.availableBalance) : 'Pilih cabang dulu'
                }}</strong>
              </div>
            </div>
          </div>

          <ul
            class="nav nav-tabs nav-fill flex-column flex-md-row pawn-contract-create-page__tabs mt-4"
            role="tablist"
          >
            <li
              class="nav-item"
              role="presentation"
            >
              <button
                id="pawn-contract-form-detail-tab"
                class="nav-link pawn-contract-create-page__tab-link"
                :class="{ active: activeStep === 1 }"
                type="button"
                role="tab"
                :aria-selected="activeStep === 1"
                aria-controls="pawn-contract-form-detail-panel"
                @click="activeStep = 1"
              >
                <span class="pawn-contract-create-page__tab-number">1</span>
                <span class="pawn-contract-create-page__tab-copy">
                  <strong>Detail gadai</strong>
                  <small>Waktu gadai, barang jaminan, nilai taksiran, dan hitungan biaya.</small>
                </span>
              </button>
            </li>

            <li
              class="nav-item"
              role="presentation"
            >
              <button
                id="pawn-contract-form-customer-tab"
                class="nav-link pawn-contract-create-page__tab-link"
                :class="{ active: activeStep === 2 }"
                type="button"
                role="tab"
                :aria-selected="activeStep === 2"
                aria-controls="pawn-contract-form-customer-panel"
                @click="handleCustomerTabClick"
              >
                <span class="pawn-contract-create-page__tab-number">2</span>
                <span class="pawn-contract-create-page__tab-copy">
                  <strong>Data nasabah</strong>
                  <small>Identitas nasabah baru atau isi otomatis dari data yang sudah ada.</small>
                </span>
              </button>
            </li>
          </ul>
        </section>

        <div
          v-if="submitError"
          class="alert alert-danger border-0 shadow-sm mt-4 mb-0"
          role="alert"
        >
          <strong class="d-block mb-1">Simpan data belum berhasil.</strong>
          <span>{{ submitError }}</span>
        </div>

        <div class="tab-content mt-4">
          <div
            id="pawn-contract-form-detail-panel"
            class="tab-pane fade"
            :class="{ 'show active': activeStep === 1 }"
            role="tabpanel"
            aria-labelledby="pawn-contract-form-detail-tab"
          >
            <div class="d-grid gap-4">
              <PawnContractFormContractSection
                :form="form"
                :field-errors="fieldErrors"
                :reference-data="referenceData"
                :maturity-date="maturityDate"
                :format-currency="formatCurrency"
                :update-form-field="updateFormField"
              />

              <PawnContractFormItemSection
                :form="form"
                :field-errors="fieldErrors"
                :item-preset-list="itemPresetList"
                :current-preset="currentPreset"
                :selected-detail-option="selectedDetailOption"
                :item-detail-placeholders="itemDetailPlaceholders"
                :update-form-field="updateFormField"
              />

              <PawnContractFormFinanceSection
                :form="form"
                :field-errors="fieldErrors"
                :available-payment-options="availablePaymentOptions"
                :storage-fee-amount="storageFeeAmount"
                :prepaid-storage-options="prepaidStorageOptions"
                :prepaid-storage-amount="prepaidStorageAmount"
                :prepaid-storage-period-label="prepaidStoragePeriodLabel"
                :item-presets="referenceData.itemPresets"
                :administration-fee-amount="administrationFeeAmount"
                :amount-in-words="amountInWords"
                :appraised-value-in-words="appraisedValueInWords"
                :projected-remaining-balance="projectedRemainingBalance"
                :has-enough-balance="hasEnoughBalance"
                :has-payments="form.hasPayments"
                :current-preset-label="currentPreset?.label ?? null"
                :format-currency="formatCurrency"
                :update-form-field="updateFormField"
                @show-formula="vm.openFormulaModal"
              />
            </div>
          </div>

          <PawnContractFormCustomerSection
            :active-step="activeStep"
            :form="form"
            :field-errors="fieldErrors"
            :reference-data="referenceData"
            :customer-name-suggestions="customerNameSuggestions"
            :customer-phone-suggestions="customerPhoneSuggestions"
            :customer-identity-number-suggestions="customerIdentityNumberSuggestions"
            :customer-lookup-message="customerLookupMessage"
            :is-step-two-auto-insert-enabled="isStepTwoAutoInsertEnabled"
            :apply-customer-lookup-from-name="applyCustomerLookupFromName"
            :apply-customer-lookup-from-phone="applyCustomerLookupFromPhone"
            :apply-customer-lookup-from-identity-number="applyCustomerLookupFromIdentityNumber"
            :set-step-two-auto-insert-enabled="setStepTwoAutoInsertEnabled"
            :update-form-field="updateFormField"
          />
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-3 mt-4">
          <button
            v-if="activeStep === 2"
            class="btn btn-outline-secondary"
            type="button"
            @click="activeStep = 1"
          >
            Kembali ke detail gadai
          </button>
          <span v-else />

          <div class="d-flex flex-column flex-sm-row gap-2">
            <!-- <button
              class="btn btn-outline-primary"
              type="button"
              @click="goToList"
            >
              Lihat data gadai
            </button> -->

            <button
              v-if="activeStep === 1"
              class="btn btn-primary"
              type="button"
              :disabled="isProcessingBlocked"
              @click="goToCustomerStep"
            >
              Lanjut ke data nasabah
            </button>

            <button
              v-else
              class="btn btn-primary"
              type="button"
              :disabled="isSubmitting || isProcessingBlocked"
              @click="submitContract"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              />
              {{ submitButtonLabel }}
            </button>
          </div>
        </div>

        <PawnContractFormStepConfirmation
          :is-open="isStepConfirmationModalOpen"
          :sections="stepConfirmationData.sections"
          @close="closeStepConfirmationModal"
          @confirm="confirmCustomerStep"
        />

        <!-- Modals -->
        <PawnContractFormulaModalComponent
          :is-open="vm.isFormulaModalOpen"
          @close="vm.closeFormulaModal"
        />
 
        <PawnContractFormValidation
          :is-open="isValidationModalOpen"
          :title="validationModalTitle"
          :messages="validationErrorMessages"
          @close="closeValidationModal"
        />

        <PawnContractFormSubmitConfirmation
          :is-open="isSubmitConfirmationModalOpen"
          :is-edit-mode="isEditMode"
          :is-submitting="isSubmitting"
          :sections="submitConfirmationData.sections"
          :status-label="submitConfirmationData.statusLabel"
          :balance-message="submitConfirmationData.balanceMessage"
          :has-enough-balance="submitConfirmationData.hasEnoughBalance"
          @close="closeSubmitConfirmationModal"
          @confirm="confirmSubmitContract"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import PawnContractFormContractSection from '@feature/pawn_contract/presentation/components/pawn_contract_form_contract_section.component.vue';
import PawnContractFormCustomerSection from '@feature/pawn_contract/presentation/components/pawn_contract_form_customer_section.component.vue';
import PawnContractFormError from '@feature/pawn_contract/presentation/components/pawn_contract_form_error.component.vue';
import PawnContractFormFinanceSection from '@feature/pawn_contract/presentation/components/pawn_contract_form_finance_section.component.vue';
import PawnContractFormulaModalComponent from '@feature/pawn_contract/presentation/components/pawn_contract_formula_modal.component.vue';
import PawnContractFormItemSection from '@feature/pawn_contract/presentation/components/pawn_contract_form_item_section.component.vue';
import PawnContractFormLoading from '@feature/pawn_contract/presentation/components/pawn_contract_form_loading.component.vue';
import PawnContractFormStepConfirmation from '@feature/pawn_contract/presentation/components/pawn_contract_form_step_confirmation.component.vue';
import PawnContractFormSubmitConfirmation from '@feature/pawn_contract/presentation/components/pawn_contract_form_submit_confirmation.component.vue';
import PawnContractFormValidation from '@feature/pawn_contract/presentation/components/pawn_contract_form_validation.component.vue';
import '@feature/pawn_contract/presentation/styles/pawn_contract_form.css';
import { pawnContractFormViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract_form.vm';

type PawnContractFormViewModel = ReturnType<typeof pawnContractFormViewModel>;

const route = useRoute();
const vm: PawnContractFormViewModel = pawnContractFormViewModel();
const {
  referenceData,
  isLoading,
  isSubmitting,
  error,
  submitError,
  activeStep,
  isEditMode,
  isStepOneAutoInsertEnabled,
  isStepTwoAutoInsertEnabled,
  isValidationModalOpen,
  validationModalTitle,
  validationErrorMessages,
  isStepConfirmationModalOpen,
  isSubmitConfirmationModalOpen,
  form,
  fieldErrors,
  loadingTitle,
  submitButtonLabel,
  itemPresetList,
  currentPreset,
  selectedDetailOption,
  itemDetailPlaceholders,
  selectedBranch,
  customerNameSuggestions,
  customerPhoneSuggestions,
  customerIdentityNumberSuggestions,
  customerLookupMessage,
  availablePaymentOptions,
  maturityDate,
  administrationFeeAmount,
  storageFeeAmount,
  prepaidStorageOptions,
  prepaidStorageAmount,
  prepaidStoragePeriodLabel,
  amountInWords,
  appraisedValueInWords,
  stepConfirmationData,
  submitConfirmationData,
  projectedRemainingBalance,
  hasEnoughBalance,
  isProcessingBlocked
} = storeToRefs(vm);

const {
  formatCurrency,
  updateFormField,
  applyCustomerLookupFromName,
  applyCustomerLookupFromPhone,
  applyCustomerLookupFromIdentityNumber,
  setStepOneAutoInsertEnabled,
  setStepTwoAutoInsertEnabled,
  closeValidationModal,
  closeStepConfirmationModal,
  confirmCustomerStep,
  closeSubmitConfirmationModal,
  confirmSubmitContract,
  goToList,
  goToCustomerStep,
  submitContract
} = vm;

const handleStepOneAutoInsertChange = (event: Event): void => {
  const { target } = event;

  if (target instanceof HTMLInputElement) {
    setStepOneAutoInsertEnabled(target.checked);
  }
};

const handleCustomerTabClick = (): void => {
  if (activeStep.value === 2) {
    return;
  }

  void goToCustomerStep();
};

// Re-inisialisasi form saat ID di rute berubah (misal navigasi antaran edit ke create atau antar edit id berbeda)
watch(
  () => route.params.contractId,
  (newId) => {
    void vm.initialize(newId);
  }
);

onMounted(() => {
  void vm.initialize(route.params.contractId);
});
</script>
