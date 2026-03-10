<template>
  <section
    id="pawn-contract-form-customer-panel"
    class="card p-4 tab-pane fade"
    :class="{ 'show active': activeStep === 2 }"
    role="tabpanel"
    aria-labelledby="pawn-contract-form-customer-tab"
  >
    <div class="pawn-contract-create-page__section-head">
      <div>
        <div class="pawn-contract-create-page__section-kicker">
          Langkah 2
        </div>
        <h2 class="pawn-contract-create-page__section-title">
          Data nasabah
        </h2>
        <p class="text-secondary mb-0">
          Ketik nama nasabah untuk mengisi otomatis data lama, atau lanjutkan sebagai nasabah baru.
        </p>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-12">
        <label
          class="form-label"
          for="customerFullName"
        >Nama lengkap nasabah</label>
        <input
          id="customerFullName"
          :value="form.customerFullName"
          class="form-control"
          type="text"
          list="pawn-contract-customer-suggestions"
          placeholder="Contoh: Andi Saputra"
          autocomplete="off"
          @input="handleCustomerNameInput"
          @change="handleCustomerNameInput"
          @blur="handleCustomerNameInput"
        >
        <datalist id="pawn-contract-customer-suggestions">
          <option
            v-for="suggestion in customerNameSuggestions"
            :key="suggestion.key"
            :value="suggestion.value"
            :label="suggestion.label"
          />
        </datalist>
        <div class="form-text">
          {{ customerLookupMessage }}
        </div>
      </div>

      <div class="col-12 col-md-6">
        <span class="form-label d-block mb-2">Jenis kelamin</span>
        <div class="d-flex flex-wrap gap-2">
          <button
            class="btn btn-outline-primary"
            type="button"
            :class="{ active: form.customerGender === PawnContractCustomerGenderEnum.Male }"
            @click="updateFormField('customerGender', PawnContractCustomerGenderEnum.Male)"
          >
            Laki-laki
          </button>
          <button
            class="btn btn-outline-primary"
            type="button"
            :class="{ active: form.customerGender === PawnContractCustomerGenderEnum.Female }"
            @click="updateFormField('customerGender', PawnContractCustomerGenderEnum.Female)"
          >
            Perempuan
          </button>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label
          class="form-label"
          for="customerBirthDate"
        >Tanggal lahir</label>
        <input
          id="customerBirthDate"
          v-model="customerBirthDateModel"
          class="form-control"
          type="date"
        >
      </div>

      <div class="col-12">
        <label
          class="form-label"
          for="customerAddress"
        >Alamat lengkap</label>
        <textarea
          id="customerAddress"
          v-model="customerAddressModel"
          class="form-control"
          rows="3"
          placeholder="Contoh: Jl. Andi Pangeran Pettarani No. 88, Panakkukang"
        />
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="customerCity"
        >Kota / kabupaten</label>
        <input
          id="customerCity"
          v-model="customerCityModel"
          class="form-control"
          type="text"
          placeholder="Contoh: Makassar"
        >
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="customerPhone"
        >Nomor telepon</label>
        <input
          id="customerPhone"
          :value="form.customerPhone"
          class="form-control"
          type="text"
          list="pawn-contract-customer-phone-suggestions"
          placeholder="Contoh: 081234567890"
          autocomplete="off"
          @input="handleCustomerPhoneInput"
          @change="handleCustomerPhoneInput"
          @blur="handleCustomerPhoneInput"
        >
        <datalist id="pawn-contract-customer-phone-suggestions">
          <option
            v-for="suggestion in customerPhoneSuggestions"
            :key="suggestion.key"
            :value="suggestion.value"
            :label="suggestion.label"
          />
        </datalist>
        <div class="form-text">
          Ketik nomor telepon untuk menampilkan maksimal 5 nasabah dari data lokal.
        </div>
      </div>

      <div class="col-12 col-md-4">
        <label
          class="form-label"
          for="customerIdentityType"
        >Jenis identitas</label>
        <select
          id="customerIdentityType"
          v-model="customerIdentityTypeModel"
          class="form-select"
        >
          <option
            v-for="option in referenceData.identityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="col-12">
        <label
          class="form-label"
          for="customerIdentityNumber"
        >Nomor identitas</label>
        <input
          id="customerIdentityNumber"
          :value="form.customerIdentityNumber"
          class="form-control"
          type="text"
          list="pawn-contract-customer-identity-suggestions"
          placeholder="Contoh: 7371xxxxxxxxxxxx"
          autocomplete="off"
          @input="handleCustomerIdentityNumberInput"
          @change="handleCustomerIdentityNumberInput"
          @blur="handleCustomerIdentityNumberInput"
        >
        <datalist id="pawn-contract-customer-identity-suggestions">
          <option
            v-for="suggestion in customerIdentityNumberSuggestions"
            :key="suggestion.key"
            :value="suggestion.value"
            :label="suggestion.label"
          />
        </datalist>
        <div class="form-text">
          Ketik nomor identitas untuk menampilkan maksimal 5 nasabah dari data lokal.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PawnContractCustomerGenderEnum } from '@core/domain/models/pawn-contract-form-enum.model';
import type {
  PawnContractFormReferenceModel,
  PawnContractFormValueModel
} from '@feature/pawn_contract/domain/models';
import type {
  PawnContractCustomerSuggestionOptionModel,
  PawnContractFormFieldUpdater
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';

interface PawnContractFormCustomerSectionProps {
  activeStep: 1 | 2;
  form: PawnContractFormValueModel;
  referenceData: PawnContractFormReferenceModel;
  customerNameSuggestions: PawnContractCustomerSuggestionOptionModel[];
  customerPhoneSuggestions: PawnContractCustomerSuggestionOptionModel[];
  customerIdentityNumberSuggestions: PawnContractCustomerSuggestionOptionModel[];
  customerLookupMessage: string;
  applyCustomerLookupFromName: () => void;
  applyCustomerLookupFromPhone: () => void;
  applyCustomerLookupFromIdentityNumber: () => void;
  updateFormField: PawnContractFormFieldUpdater;
}

const props = defineProps<PawnContractFormCustomerSectionProps>();

const activeStep = computed<1 | 2>(() => props.activeStep);
const form = computed<PawnContractFormValueModel>(() => props.form);
const referenceData = computed<PawnContractFormReferenceModel>(() => props.referenceData);
const customerNameSuggestions = computed<PawnContractCustomerSuggestionOptionModel[]>(() => props.customerNameSuggestions);
const customerPhoneSuggestions = computed<PawnContractCustomerSuggestionOptionModel[]>(() => props.customerPhoneSuggestions);
const customerIdentityNumberSuggestions = computed<PawnContractCustomerSuggestionOptionModel[]>(
  () => props.customerIdentityNumberSuggestions
);
const customerLookupMessage = computed<string>(() => props.customerLookupMessage);
const applyCustomerLookupFromName: () => void = props.applyCustomerLookupFromName;
const applyCustomerLookupFromPhone: () => void = props.applyCustomerLookupFromPhone;
const applyCustomerLookupFromIdentityNumber: () => void = props.applyCustomerLookupFromIdentityNumber;
const updateFormField: PawnContractFormFieldUpdater = props.updateFormField;

const customerBirthDateModel = computed({
  get: (): string => form.value.customerBirthDate,
  set: (value: string): void => updateFormField('customerBirthDate', value)
});

const customerAddressModel = computed({
  get: (): string => form.value.customerAddress,
  set: (value: string): void => updateFormField('customerAddress', value)
});

const customerCityModel = computed({
  get: (): string => form.value.customerCity,
  set: (value: string): void => updateFormField('customerCity', value)
});

const customerIdentityTypeModel = computed({
  get: (): PawnContractFormValueModel['customerIdentityType'] => form.value.customerIdentityType,
  set: (value: PawnContractFormValueModel['customerIdentityType']): void =>
    updateFormField('customerIdentityType', value)
});

const readInputValue = (event: Event): string => {
  const { target } = event;
  return target instanceof HTMLInputElement ? target.value : '';
};

const handleCustomerNameInput = (event: Event): void => {
  updateFormField('customerFullName', readInputValue(event));
  applyCustomerLookupFromName();
};

const handleCustomerPhoneInput = (event: Event): void => {
  updateFormField('customerPhone', readInputValue(event));
  applyCustomerLookupFromPhone();
};

const handleCustomerIdentityNumberInput = (event: Event): void => {
  updateFormField('customerIdentityNumber', readInputValue(event));
  applyCustomerLookupFromIdentityNumber();
};
</script>
