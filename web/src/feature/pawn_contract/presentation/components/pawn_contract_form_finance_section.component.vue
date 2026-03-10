<template>
  <section class="card p-4">
    <div class="pawn-contract-create-page__section-head">
      <div>
        <div class="pawn-contract-create-page__section-kicker">
          Nilai dan biaya
        </div>
        <h2 class="pawn-contract-create-page__section-title">
          Hitungan pencairan
        </h2>
        <p class="text-secondary mb-0">
          Nilai terbilang, biaya titip, dan total bayar di muka dihitung otomatis.
        </p>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12 col-md-6">
        <label
          class="form-label"
          for="appraisedValue"
        >Nilai taksiran</label>
        <input
          id="appraisedValue"
          v-model="appraisedValueInputModel"
          class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.appraisedValue }"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Contoh: 5.000.000"
        >
        <div
          v-if="fieldErrors.appraisedValue"
          class="invalid-feedback d-block"
        >
          {{ fieldErrors.appraisedValue }}
        </div>
        <div class="form-text">
          {{ formatCurrency(form.appraisedValue) }}
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label
          class="form-label"
          for="disbursedValue"
        >Dana pencairan</label>
        <input
          id="disbursedValue"
          v-model="disbursedValueInputModel"
          class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.disbursedValue }"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Contoh: 3.500.000"
        >
        <div
          v-if="fieldErrors.disbursedValue"
          class="invalid-feedback d-block"
        >
          {{ fieldErrors.disbursedValue }}
        </div>
        <div
          v-if="showAmountInWords"
          class="form-text"
        >
          {{ amountInWords }}
        </div>
      </div>

      <div class="col-12">
        <span class="form-label d-block mb-2">Skema biaya titip</span>
        <div class="row row-cols-1 row-cols-md-3 g-3">
          <div
            v-for="option in availablePaymentOptions"
            :key="option.value"
            class="col"
          >
            <button
              class="pawn-contract-create-page__payment-option w-100 text-start"
              type="button"
              :class="{ 'is-active': form.paymentOptionDays === option.value }"
              @click="updateFormField('paymentOptionDays', option.value)"
            >
              <span class="pawn-contract-create-page__option-copy">
                <strong>{{ option.label }}</strong>
                <small>{{ option.helper }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label">Biaya titip per periode</label>
        <div class="pawn-contract-create-page__metric-box">
          <strong>{{ formatCurrency(storageFeeAmount) }}</strong>
          <span>Dihitung otomatis dari dana pencairan dan aturan barang.</span>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="prepaidStoragePeriods"
        >Biaya titip dibayar di muka</label>
        <select
          id="prepaidStoragePeriods"
          v-model.number="prepaidStoragePeriodsModel"
          class="form-select"
        >
          <option
            v-for="option in prepaidStorageOptions"
            :key="option"
            :value="option"
          >
            {{ formatPrepaidStorageOptionLabel(option) }}
          </option>
        </select>
        <div class="form-text">
          Rentang sistem: {{ prepaidStoragePeriodLabel }}
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label">Biaya admin</label>
        <div class="pawn-contract-create-page__metric-box">
          <strong>{{ formatCurrency(administrationFeeAmount) }}</strong>
          <span>{{ currentPresetLabel ?? 'Jenis barang' }} memakai biaya admin tetap.</span>
        </div>
      </div>

      <div class="col-12">
        <div class="pawn-contract-create-page__summary-strip">
          <div>
            <span>Total biaya titip dibayar di muka</span>
            <strong>{{ formatCurrency(prepaidStorageAmount) }}</strong>
          </div>
          <div>
            <span>Uang yang diberikan kepada nasabah</span>
            <strong class="text-success">{{ formatCurrency(customerReceivedAmount) }}</strong>
          </div>
          <div>
            <span>Sisa saldo cabang setelah pencairan</span>
            <strong :class="hasEnoughBalance ? 'text-primary' : 'text-danger'">
              {{ formatCurrency(projectedRemainingBalance) }}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PawnContractPaymentOptionDaysEnum } from '@core/domain/models/pawn-contract-form-enum.model';
import type {
  PawnContractFormValueModel,
  PawnContractOptionModel
} from '@feature/pawn_contract/domain/models';
import type {
  PawnContractFormFieldErrorMap,
  PawnContractFormFieldUpdater
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

interface PawnContractFormFinanceSectionProps {
  form: PawnContractFormValueModel;
  fieldErrors: PawnContractFormFieldErrorMap;
  availablePaymentOptions: Array<PawnContractOptionModel<PawnContractPaymentOptionDaysEnum>>;
  storageFeeAmount: number;
  prepaidStorageOptions: number[];
  prepaidStorageAmount: number;
  prepaidStoragePeriodLabel: string;
  administrationFeeAmount: number;
  amountInWords: string;
  projectedRemainingBalance: number;
  hasEnoughBalance: boolean;
  currentPresetLabel: string | null;
  formatCurrency: (value: number) => string;
  updateFormField: PawnContractFormFieldUpdater;
}

const props = defineProps<PawnContractFormFinanceSectionProps>();

const form = computed<PawnContractFormValueModel>(() => props.form);
const fieldErrors = computed<PawnContractFormFieldErrorMap>(() => props.fieldErrors);
const availablePaymentOptions = computed<Array<PawnContractOptionModel<PawnContractPaymentOptionDaysEnum>>>(
  () => props.availablePaymentOptions
);
const storageFeeAmount = computed<number>(() => props.storageFeeAmount);
const prepaidStorageOptions = computed<number[]>(() => props.prepaidStorageOptions);
const prepaidStorageAmount = computed<number>(() => props.prepaidStorageAmount);
const prepaidStoragePeriodLabel = computed<string>(() => props.prepaidStoragePeriodLabel);
const administrationFeeAmount = computed<number>(() => props.administrationFeeAmount);
const amountInWords = computed<string>(() => props.amountInWords);
const projectedRemainingBalance = computed<number>(() => props.projectedRemainingBalance);
const hasEnoughBalance = computed<boolean>(() => props.hasEnoughBalance);
const currentPresetLabel = computed<string | null>(() => props.currentPresetLabel);
const showAmountInWords = computed<boolean>(() => form.value.disbursedValue > 0);
const customerReceivedAmount = computed<number>(() =>
  Math.max(0, form.value.disbursedValue - prepaidStorageAmount.value - administrationFeeAmount.value)
);
const formatCurrency: (value: number) => string = props.formatCurrency;
const updateFormField: PawnContractFormFieldUpdater = props.updateFormField;

const formatRupiahInput = (value: number): string => {
  if (value <= 0) {
    return '';
  }

  return new Intl.NumberFormat('id-ID').format(value);
};

const parseRupiahInput = (value: string): number => {
  const normalizedValue = value.replace(/\D/g, '');

  if (!normalizedValue) {
    return 0;
  }

  return Number.parseInt(normalizedValue, 10);
};

const formatPrepaidStorageOptionLabel = (value: number): string =>
  value === 0 ? 'Belum pembayaran di muka' : `${value} periode`;

const appraisedValueInputModel = computed({
  get: (): string => formatRupiahInput(form.value.appraisedValue),
  set: (value: string): void => updateFormField('appraisedValue', parseRupiahInput(value))
});

const disbursedValueInputModel = computed({
  get: (): string => formatRupiahInput(form.value.disbursedValue),
  set: (value: string): void => updateFormField('disbursedValue', parseRupiahInput(value))
});

const prepaidStoragePeriodsModel = computed({
  get: (): number => form.value.prepaidStoragePeriods,
  set: (value: number): void => updateFormField('prepaidStoragePeriods', value)
});
</script>
