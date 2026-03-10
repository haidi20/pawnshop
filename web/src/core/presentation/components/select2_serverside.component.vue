<template>
  <div class="position-relative">
    <VueSelect
      :id="fieldId"
      v-model="internalValue"
      :options="vm.options"
      :placeholder="placeholder || 'Pilih data...'"
      :reduce="resolvedReduce"
      :label="resolvedLabel"
      :filterable="false"
      :clearable="!disabled"
      :disabled="disabled"
      append-to-body
      class="ps-select"
      @open="onOpen"
      @search="onSearch"
    >
      <template #open-indicator="{ attributes }">
        <i
          class="bi bi-chevron-down"
          v-bind="attributes"
        />
      </template>

      <template #no-options="{ search, searching }">
        <div class="ps-select__message">
          <template v-if="vm.loading">
            Memuat data...
          </template>
          <template v-else-if="searching && search">
            Tidak ada hasil untuk "{{ search }}"
          </template>
          <template v-else>
            Ketik kata kunci untuk mulai mencari.
          </template>
        </div>
      </template>
    </VueSelect>

    <div
      v-if="vm.loading"
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
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

import { Select2ServerSideVM } from '@/core/presentation/view_models/select2_serverside.vm';

const props = defineProps<{
  vm: Select2ServerSideVM;
  fieldId?: string;
  fieldName?: string;
  placeholder?: string;
  disabled?: boolean;
  modelValue?: any;
  label?: string;
  reduce?: (data: any) => any;
  nameVModel?: string;
}>();

const emit = defineEmits(['update:modelValue', 'change', 'update:nameVModel']);

const resolvedLabel = computed(() => props.label || 'text');
const resolvedReduce = computed(() => props.reduce || ((data: any) => data.id));

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const syncSelectedName = (value: any) => {
  if (!props.fieldName) {
    return;
  }

  const selectedOption = props.vm.options.find((option) => resolvedReduce.value(option) == value);
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

const onOpen = async () => {
  if (props.vm.options.length === 0) {
    await props.vm.search('');
  }
};

const onSearch = (searchQuery: string, loadingFn: (state: boolean) => void) => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  loadingFn(true);

  searchTimer = setTimeout(async () => {
    try {
      await props.vm.search(searchQuery.trim());
    } finally {
      loadingFn(false);
    }
  }, 320);
};

onMounted(() => {
  if (props.modelValue && props.nameVModel) {
    const exists = props.vm.options.some(
      (option) => resolvedReduce.value(option) == props.modelValue
    );
    if (!exists) {
      props.vm.ensureOption({
        id: props.modelValue,
        [resolvedLabel.value]: props.nameVModel,
      });
    }
  }
});

watch(
  () => [props.modelValue, props.vm.options.length],
  () => {
    syncSelectedName(props.modelValue);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});
</script>
