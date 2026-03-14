<template>
  <section class="card p-4">
    <div class="pawn-contract-create-page__section-head">
      <div class="row align-items-center mb-3">
        <div class="col">
          <h5 class="card-title mb-0">Hitungan Pencairan Otomatis</h5>
          <p class="card-subtitle text-muted small">
            Tentukan dana pinjaman dan skema pembayaran yang sesuai.
          </p>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-formula-info btn-sm rounded-pill px-3" @click="emit('showFormula')">
            <i class="bi bi-info-circle me-1"></i> Informasi Rumus
          </button>
        </div>
      </div>
    </div>

    <div v-if="isVehicleDailyDisabled && form.itemKind === PawnContractItemKindEnum.Vehicle"
      class="alert alert-info d-flex align-items-center mb-3" role="alert">
      <i class="bi bi-info-circle-fill me-2"></i>
      <div>
        <strong>Info Restriksi:</strong> Khusus kategori <strong>Kendaraan</strong>, skema pembayaran
        <strong>Harian</strong> tidak tersedia demi keamanan transaksi.
      </div>
    </div>

    <div v-if="isFinanceLocked" class="alert alert-warning d-flex align-items-center mb-3" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>
        <strong>Data finansial terkunci:</strong> Kontrak ini sudah memiliki riwayat pembayaran biaya titip
        (<strong>{{ form.storageFeePaymentCount }}x</strong>).
        Nilai appraisal, pinjaman, dan skema biaya tidak dapat lagi diubah manual.
      </div>
    </div>

    <div v-if="!isFinanceLocked && hasPayments" class="alert alert-info d-flex align-items-center mb-3" role="alert">
      <i class="bi bi-info-circle-fill me-2"></i>
      <div>
        <strong>Riwayat pembayaran terdeteksi:</strong> Kontrak ini memiliki riwayat pembayaran (admin/lainnya),
        namun <strong>biaya titip belum pernah dibayar</strong>. Data finansial masih dapat diubah.
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12 col-md-6">
        <label class="form-label" for="appraisedValue">Nilai taksiran</label>
        <input id="appraisedValue" v-model="appraisedValueInputModel" class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.appraisedValue }" type="text" inputmode="numeric" autocomplete="off"
          placeholder="Contoh: 5.000.000" :disabled="isFinanceLocked">
        <div v-if="fieldErrors.appraisedValue" class="invalid-feedback d-block">
          {{ fieldErrors.appraisedValue }}
        </div>
        <div v-if="showAppraisedAmountInWords" class="form-text">
          {{ appraisedValueInWords }}
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label class="form-label" for="disbursedValue">Dana pencairan</label>
        <input id="disbursedValue" v-model="disbursedValueInputModel" class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.disbursedValue }" type="text" inputmode="numeric" autocomplete="off"
          placeholder="Contoh: 3.500.000" :disabled="isFinanceLocked">
        <div v-if="fieldErrors.disbursedValue" class="invalid-feedback d-block">
          {{ fieldErrors.disbursedValue }}
        </div>
        <div v-if="showAmountInWords" class="form-text">
          {{ amountInWords }}
        </div>
      </div>

      <div class="col-12">
        <span class="form-label d-block mb-2">Skema biaya titip</span>
        <div class="row row-cols-1 row-cols-md-3 g-3">
          <div v-for="option in availablePaymentOptions" :key="option.value" class="col">
            <button class="pawn-contract-create-page__payment-option w-100 text-start" type="button"
              :class="{ 'is-active': form.paymentOptionDays === option.value }" :disabled="isFinanceLocked"
              @click="updateFormField('paymentOptionDays', option.value)">
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
        <label class="form-label" for="prepaidStoragePeriods">Biaya titip dibayar di muka</label>
        <select id="prepaidStoragePeriods" v-model.number="prepaidStoragePeriodsModel" class="form-select"
          :disabled="isFinanceLocked">
          <option v-for="option in prepaidStorageOptions" :key="option" :value="option">
            {{ formatPrepaidStorageOptionLabel(option) }}
          </option>
        </select>
        <!-- <div class="form-text">
          Rentang sistem: {{ prepaidStoragePeriodLabel }}
        </div> -->
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label">Biaya admin</label>
        <div class="form-control-plaintext fw-bold text-primary">
          {{ formatCurrency(administrationFeeAmount) }}
        </div>
        <div class="form-text">
          {{ currentPresetLabel ?? 'Jenis barang' }} memakai biaya admin tetap.
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
import { computed, ref, onMounted } from 'vue';
import {
  PawnContractPaymentOptionDaysEnum,
  PawnContractItemKindEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import type {
  PawnContractFormValueModel,
  PawnContractOptionModel,
  PawnContractItemPresetModel
} from '@feature/pawn_contract/domain/models';
import type {
  PawnContractFormFieldErrorMap,
  PawnContractFormFieldUpdater
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';
import { SETTING_KEY_VEHICLE_DAILY_DISABLED } from '@core/data/datasources/setting_local_datasource';
import { pawnContractRepository } from '@feature/pawn_contract/presentation/di/pawn_contract.di';

interface PawnContractFormFinanceSectionProps {
  form: PawnContractFormValueModel;
  fieldErrors: PawnContractFormFieldErrorMap;
  availablePaymentOptions: Array<PawnContractOptionModel<PawnContractPaymentOptionDaysEnum>>;
  storageFeeAmount: number;
  prepaidStorageOptions: number[];
  prepaidStorageAmount: number;
  prepaidStoragePeriodLabel: string;
  itemPresets: Record<string, PawnContractItemPresetModel>;
  administrationFeeAmount: number;
  amountInWords: string;
  appraisedValueInWords: string;
  projectedRemainingBalance: number;
  hasEnoughBalance: boolean;
  currentPresetLabel: string | null;
  hasPayments: boolean;
  formatCurrency: (value: number) => string;
  updateFormField: PawnContractFormFieldUpdater;
}

const emit = defineEmits<{
  (e: 'showFormula'): void;
}>();

const props = defineProps<PawnContractFormFinanceSectionProps>();

const isVehicleDailyDisabled = ref(true);

onMounted(async () => {
  isVehicleDailyDisabled.value = await pawnContractRepository.getSettingBoolean(SETTING_KEY_VEHICLE_DAILY_DISABLED, true);
});

const form = computed<PawnContractFormValueModel>(() => props.form);
const fieldErrors = computed<PawnContractFormFieldErrorMap>(() => props.fieldErrors);
const availablePaymentOptions = computed<Array<PawnContractOptionModel<PawnContractPaymentOptionDaysEnum>>>(
  () => props.availablePaymentOptions
);
const itemPresets = computed(() => props.itemPresets);
const administrationFeeAmount = computed(() => props.administrationFeeAmount);
const storageFeeAmount = computed<number>(() => props.storageFeeAmount);
const prepaidStorageOptions = computed<number[]>(() => props.prepaidStorageOptions);
const prepaidStorageAmount = computed<number>(() => props.prepaidStorageAmount);
const prepaidStoragePeriodLabel = computed<string>(() => props.prepaidStoragePeriodLabel);
const administrationFeeAmountValue = computed<number>(() => props.administrationFeeAmount);
const amountInWords = computed<string>(() => props.amountInWords);
const appraisedValueInWords = computed<string>(() => props.appraisedValueInWords);
const projectedRemainingBalance = computed<number>(() => props.projectedRemainingBalance);
const hasEnoughBalance = computed<boolean>(() => props.hasEnoughBalance);
const currentPresetLabel = computed<string | null>(() => props.currentPresetLabel);
const hasPayments = computed<boolean>(() => props.hasPayments);
const isFinanceLocked = computed<boolean>(() => form.value.storageFeePaymentCount > 0);
const showAmountInWords = computed<boolean>(() => form.value.disbursedValue > 0);
const showAppraisedAmountInWords = computed<boolean>(() => form.value.appraisedValue > 0);
const customerReceivedAmount = computed<number>(() =>
  Math.max(0, form.value.disbursedValue - prepaidStorageAmount.value - administrationFeeAmountValue.value)
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
