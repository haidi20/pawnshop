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
        <label
          class="form-label"
          for="branchId"
        >Cabang aktif</label>
        <select
          id="branchId"
          v-model.number="branchIdModel"
          class="form-select"
        >
          <option
            :value="0"
            disabled
          >
            Pilih cabang
          </option>
          <option
            v-for="branch in referenceData.branches"
            :key="branch.id"
            :value="branch.id"
          >
            {{ branch.branchName }} | saldo {{ formatCurrency(branch.availableBalance) }}
          </option>
        </select>
        <div class="form-text">
          Hanya cabang dengan akun kas aktif yang ditampilkan.
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <label
          class="form-label"
          for="contractNumber"
        >Nomor gadai</label>
        <input
          id="contractNumber"
          :value="form.contractNumber"
          class="form-control"
          type="text"
          readonly
        >
        <div class="form-text">
          Nomor dibuat otomatis dari data lokal terakhir.
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="termDays"
        >Durasi gadai</label>
        <select
          id="termDays"
          v-model.number="termDaysModel"
          class="form-select"
        >
          <option
            v-for="option in referenceData.termOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="contractDate"
        >Tanggal mulai gadai</label>
        <input
          id="contractDate"
          v-model="contractDateModel"
          class="form-control"
          type="date"
        >
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="maturityDate"
        >Jatuh tempo</label>
        <input
          id="maturityDate"
          class="form-control"
          type="date"
          :value="maturityDate"
          readonly
        >
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
import type { PawnContractFormFieldUpdater } from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

interface PawnContractFormContractSectionProps {
  form: PawnContractFormValueModel;
  referenceData: PawnContractFormReferenceModel;
  maturityDate: string;
  formatCurrency: (value: number) => string;
  updateFormField: PawnContractFormFieldUpdater;
}

const props = defineProps<PawnContractFormContractSectionProps>();

const form = computed<PawnContractFormValueModel>(() => props.form);
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
