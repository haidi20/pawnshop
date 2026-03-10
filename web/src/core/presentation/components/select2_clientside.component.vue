<template>
  <div class="position-relative">
    <VueSelect
      :id="fieldId"
      v-model="internalValue"
      :options="getData"
      :placeholder="placeholder || 'Pilih data...'"
      :reduce="resolvedReduce"
      :label="resolvedLabel"
      :clearable="!disabled"
      :disabled="disabled"
      :searchable="true"
      append-to-body
      class="ps-select"
      @open="$emit('open')"
      @close="$emit('close')"
      @search="(query: string) => $emit('search', query)"
    >
      <template #open-indicator="{ attributes }">
        <i
          class="bi bi-chevron-down"
          v-bind="attributes"
        />
      </template>

      <template #no-options="{ search, searching }">
        <div class="ps-select__message">
          <template v-if="loading">
            Memuat data...
          </template>
          <template v-else-if="searching && search">
            Tidak ada hasil untuk "{{ search }}"
          </template>
          <template v-else>
            Silakan pilih data yang tersedia.
          </template>
        </div>
      </template>
    </VueSelect>

    <div
      v-if="loading"
      class="ps-select__loader"
    >
      <div
        class="spinner-border spinner-border-sm text-primary"
        role="status"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

const props = defineProps<{
  getData: any[];
  fieldId?: string;
  fieldName?: string;
  placeholder?: string;
  disabled?: boolean;
  modelValue?: any;
  label?: string;
  reduce?: (data: any) => any;
  nameVModel?: string;
  commitName?: string;
  loading?: boolean;
}>();

const emit = defineEmits([
  'update:modelValue',
  'change',
  'update:nameVModel',
  'open',
  'close',
  'search',
]);

const resolvedLabel = computed(() => props.label || 'text');
const resolvedReduce = computed(() => props.reduce || ((data: any) => data.id));

const syncSelectedName = (value: any) => {
  if (!props.fieldName) {
    return;
  }

  const selectedOption = props.getData.find((option) => resolvedReduce.value(option) == value);
  emit('update:nameVModel', selectedOption ? (selectedOption[resolvedLabel.value] ?? '') : '');
};

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
    syncSelectedName(value);
    emit('change', value);
  },
});

watch(
  () => [props.modelValue, props.getData.length],
  () => {
    syncSelectedName(props.modelValue);
  },
  { immediate: true }
);
</script>
