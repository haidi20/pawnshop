<template>
  <section class="card p-4">
    <div class="pawn-contract-create-page__section-head">
      <div>
        <div class="pawn-contract-create-page__section-kicker">
          Barang jaminan
        </div>
        <h2 class="pawn-contract-create-page__section-title">
          Profil barang yang digadaikan
        </h2>
        <p class="text-secondary mb-0">
          Tampilkan informasi inti barang dengan bahasa yang mudah dipahami petugas.
        </p>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12">
        <label
          class="form-label"
          for="itemName"
        >Nama barang jaminan</label>
        <input
          id="itemName"
          v-model="itemNameModel"
          class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.itemName }"
          type="text"
          placeholder="Contoh: iPhone 13 Pro 128GB"
        >
        <div
          v-if="fieldErrors.itemName"
          class="invalid-feedback d-block"
        >
          {{ fieldErrors.itemName }}
        </div>
      </div>

      <div class="col-12">
        <span class="form-label d-block mb-2">Kelompok barang</span>
        <div class="row row-cols-1 row-cols-md-2 g-3">
          <div
            v-for="preset in itemPresetList"
            :key="preset.kind"
            class="col"
          >
            <button
              class="pawn-contract-create-page__item-kind w-100 text-start"
              type="button"
              :class="{ 'is-active': form.itemKind === preset.kind }"
              @click="updateFormField('itemKind', preset.kind)"
            >
              <span class="pawn-contract-create-page__option-copy">
                <strong>{{ preset.label }}</strong>
                <small>{{ preset.description }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label
              class="form-label"
              for="itemDetailType"
            >Jenis detail barang</label>
            <select
              id="itemDetailType"
              v-model="itemDetailTypeModel"
              class="form-select"
              :class="{ 'is-invalid': !!fieldErrors.itemDetailType }"
            >
              <option
                v-for="option in currentPreset?.detailOptions ?? []"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <div
              v-if="fieldErrors.itemDetailType"
              class="invalid-feedback d-block"
            >
              {{ fieldErrors.itemDetailType }}
            </div>
          </div>

          <div class="col-12 col-md-6 pawn-contract-create-page__metric-field">
            <label class="form-label">Aturan biaya yang dipakai</label>
            <div class="pawn-contract-create-page__metric-box">
              <strong>{{ currentPreset?.label ?? '-' }}</strong>
              <span>
                Margin {{ selectedDetailOption?.marginRate ?? 0 }}% | Potongan {{
                  selectedDetailOption?.deductionRate ?? 0
                }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label
              class="form-label"
              for="itemDetailFirst"
            >{{ currentPreset?.detailLabels.first }}</label>
            <input
              id="itemDetailFirst"
              v-model="itemDetailFirstModel"
              class="form-control"
              :class="{ 'is-invalid': !!fieldErrors.itemDetailFirst }"
              type="text"
              :placeholder="itemDetailPlaceholders.first"
            >
            <div
              v-if="fieldErrors.itemDetailFirst"
              class="invalid-feedback d-block"
            >
              {{ fieldErrors.itemDetailFirst }}
            </div>
          </div>

          <div class="col-12 col-md-4">
            <label
              class="form-label"
              for="itemDetailSecond"
            >{{ currentPreset?.detailLabels.second }}</label>
            <input
              id="itemDetailSecond"
              v-model="itemDetailSecondModel"
              class="form-control"
              :class="{ 'is-invalid': !!fieldErrors.itemDetailSecond }"
              type="text"
              :placeholder="itemDetailPlaceholders.second"
            >
            <div
              v-if="fieldErrors.itemDetailSecond"
              class="invalid-feedback d-block"
            >
              {{ fieldErrors.itemDetailSecond }}
            </div>
          </div>

          <div class="col-12 col-md-4">
            <label
              class="form-label"
              for="itemDetailThird"
            >{{ currentPreset?.detailLabels.third }}</label>
            <input
              id="itemDetailThird"
              v-model="itemDetailThirdModel"
              class="form-control"
              :class="{ 'is-invalid': !!fieldErrors.itemDetailThird }"
              type="text"
              :placeholder="itemDetailPlaceholders.third"
            >
            <div
              v-if="fieldErrors.itemDetailThird"
              class="invalid-feedback d-block"
            >
              {{ fieldErrors.itemDetailThird }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <label
          class="form-label"
          for="accessorySummary"
        >Kelengkapan barang</label>
        <textarea
          id="accessorySummary"
          v-model="accessorySummaryModel"
          class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.accessorySummary }"
          rows="3"
          placeholder="Contoh: dus, charger 20W, kabel data, headset"
        />
        <div
          v-if="fieldErrors.accessorySummary"
          class="invalid-feedback d-block"
        >
          {{ fieldErrors.accessorySummary }}
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <label
          class="form-label"
          for="issueSummary"
        >Catatan kekurangan atau kerusakan</label>
        <textarea
          id="issueSummary"
          v-model="issueSummaryModel"
          class="form-control"
          :class="{ 'is-invalid': !!fieldErrors.issueSummary }"
          rows="3"
          placeholder="Contoh: backdoor lecet tipis, battery health 82%, tanpa kartu garansi"
        />
        <div
          v-if="fieldErrors.issueSummary"
          class="invalid-feedback d-block"
        >
          {{ fieldErrors.issueSummary }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  PawnContractFormValueModel,
  PawnContractItemPresetModel,
  PawnContractItemTypeOptionModel
} from '@feature/pawn_contract/domain/models';
import type {
  PawnContractFormFieldErrorMap,
  PawnContractFormFieldUpdater,
  PawnContractItemDetailPlaceholderModel
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

interface PawnContractFormItemSectionProps {
  form: PawnContractFormValueModel;
  fieldErrors: PawnContractFormFieldErrorMap;
  itemPresetList: PawnContractItemPresetModel[];
  currentPreset: PawnContractItemPresetModel | null;
  selectedDetailOption: PawnContractItemTypeOptionModel | null;
  itemDetailPlaceholders: PawnContractItemDetailPlaceholderModel;
  updateFormField: PawnContractFormFieldUpdater;
}

const props = defineProps<PawnContractFormItemSectionProps>();

const form = computed<PawnContractFormValueModel>(() => props.form);
const fieldErrors = computed<PawnContractFormFieldErrorMap>(() => props.fieldErrors);
const itemPresetList = computed<PawnContractItemPresetModel[]>(() => props.itemPresetList);
const currentPreset = computed<PawnContractItemPresetModel | null>(() => props.currentPreset);
const selectedDetailOption = computed<PawnContractItemTypeOptionModel | null>(() => props.selectedDetailOption);
const itemDetailPlaceholders = computed<PawnContractItemDetailPlaceholderModel>(() => props.itemDetailPlaceholders);
const updateFormField: PawnContractFormFieldUpdater = props.updateFormField;

const itemNameModel = computed({
  get: (): string => form.value.itemName,
  set: (value: string): void => updateFormField('itemName', value)
});

const itemDetailTypeModel = computed({
  get: (): string => form.value.itemDetailType,
  set: (value: string): void => updateFormField('itemDetailType', value)
});

const itemDetailFirstModel = computed({
  get: (): string => form.value.itemDetailFirst,
  set: (value: string): void => updateFormField('itemDetailFirst', value)
});

const itemDetailSecondModel = computed({
  get: (): string => form.value.itemDetailSecond,
  set: (value: string): void => updateFormField('itemDetailSecond', value)
});

const itemDetailThirdModel = computed({
  get: (): string => form.value.itemDetailThird,
  set: (value: string): void => updateFormField('itemDetailThird', value)
});

const accessorySummaryModel = computed({
  get: (): string => form.value.accessorySummary,
  set: (value: string): void => updateFormField('accessorySummary', value)
});

const issueSummaryModel = computed({
  get: (): string => form.value.issueSummary,
  set: (value: string): void => updateFormField('issueSummary', value)
});
</script>
