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
            <div class="d-flex align-items-center gap-1">
              <label class="form-label mb-0">Aturan biaya yang dipakai</label>
              <button
                type="button"
                class="btn btn-link p-0 text-info lh-1"
                title="Klik untuk melihat rumus biaya"
                @click="isRuleModalOpen = true"
              >
                <i class="bi bi-info-circle fs-6"></i>
              </button>
            </div>
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

    <!-- Modal Rumus & Aturan Biaya -->
    <BaseModalComponent
      :is-open="isRuleModalOpen"
      size="lg"
      @close="isRuleModalOpen = false"
    >
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold text-primary">Rumus & Perhitungan Biaya Titip</h5>
        <button type="button" class="btn-close" @click="isRuleModalOpen = false"></button>
      </div>
      <div class="modal-body pt-3">
        <div class="alert alert-primary border-0 bg-primary bg-opacity-10 mb-4">
          <div class="d-flex gap-3">
            <i class="bi bi-calculator fs-3 text-primary"></i>
            <div>
              <h6 class="fw-bold mb-1">Rumus Dasar Biaya (Per 15 Hari)</h6>
              <p class="mb-0 small text-dark">
                <code>(Dana Pencairan × Margin%) - (Dana Pencairan × Potongan%)</code>
              </p>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-6">
            <h6 class="fw-bold fs-7 text-uppercase text-secondary mb-3">Distribusi Per Skema</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Skema</th>
                    <th>Pembagi Rumah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Harian</td>
                    <td>Rumus / 14 / 7 Hari</td>
                  </tr>
                  <tr>
                    <td>Per 7 Hari</td>
                    <td>Rumus / 2</td>
                  </tr>
                  <tr>
                    <td>Per 15 Hari</td>
                    <td>Rumus / 1 (Tetap)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-6 text-dark">
            <h6 class="fw-bold fs-7 text-uppercase text-secondary mb-3">Contoh Perhitungan</h6>
            <div class="bg-light p-3 rounded-3 small">
              <div class="mb-2"><strong>Input:</strong></div>
              <ul class="list-unstyled mb-3 ps-2 border-start border-primary border-3">
                <li>Pinjaman: 1.000.000</li>
                <li>Margin: 10% | Potongan: 0%</li>
                <li>Skema: Per 7 Hari</li>
              </ul>
              <div><strong>Langkah:</strong></div>
              <ol class="ps-3 mb-0">
                <li>Gross: 1jt × 10% = 100rb</li>
                <li>Bersih: 100rb - 0rd = 100rb</li>
                <li>Skema 7 Hari: 100rb / 2 = <strong>50.000</strong></li>
              </ol>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 border rounded-3 bg-light-subtle small text-muted italic">
          <i class="bi bi-info-circle me-1"></i> Penaksir akan membayangkan nominal ini 
          setiap periode pembayaran berdasarkan barang <strong>{{ currentPreset?.label }}</strong> yang sedang diisi.
        </div>
      </div>
      <div class="modal-footer border-0">
        <button
          type="button"
          class="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
          @click="isRuleModalOpen = false"
        >
          Tutup Informasi
        </button>
      </div>
    </BaseModalComponent>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';
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

const isRuleModalOpen = ref(false);

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
