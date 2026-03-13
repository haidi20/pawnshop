<template>
  <section class="card p-4">
    <div class="pawn-contract-create-page__section-head">
      <div>
        <div class="pawn-contract-create-page__section-kicker">
          Cabang dan Jangka Waktu
        </div>
        <h2 class="pawn-contract-create-page__section-title">
          Informasi gadai
        </h2>
        <p class="text-secondary mb-0">
          Pilih cabang, cek nomor gadai otomatis, lalu tentukan durasi gadai.
        </p>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12 col-lg-6">
        <label class="form-label" for="branchId">Cabang aktif</label>
        <select id="branchId" v-model.number="branchIdModel" class="form-select"
          :class="{ 'is-invalid': !!fieldErrors.branchId }">
          <option :value="0" disabled>
            Pilih cabang
          </option>
          <option v-for="branch in referenceData.branches" :key="branch.id" :value="branch.id">
            {{ branch.branchName }} | saldo {{ formatCurrency(branch.availableBalance) }}
          </option>
        </select>
        <div class="form-text">
          Hanya cabang dengan akun kas aktif yang ditampilkan.
        </div>
        <div v-if="fieldErrors.branchId" class="invalid-feedback d-block">
          {{ fieldErrors.branchId }}
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <label class="form-label" for="contractNumber">Nomor gadai</label>
        <input id="contractNumber" :value="form.contractNumber" class="form-control" type="text" readonly>
        <div class="form-text">
          Nomor dibuat otomatis dari data terakhir.
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label" for="termDays">Durasi gadai</label>
        <select id="termDays" v-model.number="termDaysModel" class="form-select">
          <option v-for="option in referenceData.termOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="col-12 col-md-4">
        <label class="form-label" for="contractDate">Tanggal mulai gadai</label>
        <input id="contractDate" v-model="contractDateModel" class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.contractDate }" type="date">
        <div v-if="fieldErrors.contractDate" class="invalid-feedback d-block">
          {{ fieldErrors.contractDate }}
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="pawn-contract-create-page__readonly-label">
          <label class="form-label mb-0" for="maturityDate">Jatuh tempo</label>
          <span class="pawn-contract-create-page__readonly-badge">
            Otomatis
          </span>
        </div>
        <div class="pawn-contract-create-page__readonly-field">
          <input id="maturityDate" class="form-control pawn-contract-create-page__readonly-input" type="date"
            :value="maturityDate" readonly aria-readonly="true">
          <i class="bi bi-lock" aria-hidden="true" />
        </div>
        <div class="form-text">
          Tanggal jatuh tempo dihitung otomatis dari tanggal mulai dan durasi gadai.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  PawnContractFormReferenceModel,
  PawnContractFormValueModel
} from '@feature/pawn_contract/domain/models';
import type {
  PawnContractFormFieldErrorMap,
  PawnContractFormFieldUpdater
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

interface PawnContractFormContractSectionProps {
  form: PawnContractFormValueModel;
  fieldErrors: PawnContractFormFieldErrorMap;
  referenceData: PawnContractFormReferenceModel;
  maturityDate: string;
  formatCurrency: (value: number) => string;
  updateFormField: PawnContractFormFieldUpdater;
}

const props = defineProps<PawnContractFormContractSectionProps>();

const form = computed<PawnContractFormValueModel>(() => props.form);
const fieldErrors = computed<PawnContractFormFieldErrorMap>(() => props.fieldErrors);
const referenceData = computed<PawnContractFormReferenceModel>(() => props.referenceData);
const maturityDate = computed<string>(() => props.maturityDate);
const formatCurrency: (value: number) => string = props.formatCurrency;
const updateFormField: PawnContractFormFieldUpdater = props.updateFormField;

const branchIdModel = computed({
  get: (): number => form.value.branchId,
  set: (value: number): void => updateFormField('branchId', value)
});

const termDaysModel = computed({
  get: (): PawnContractFormValueModel['termDays'] => form.value.termDays,
  set: (value: PawnContractFormValueModel['termDays']): void => updateFormField('termDays', value)
});

const contractDateModel = computed({
  get: (): string => form.value.contractDate,
  set: (value: string): void => updateFormField('contractDate', value)
});
</script>
