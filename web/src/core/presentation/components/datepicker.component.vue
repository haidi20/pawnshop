<template>
  <VueDatePicker
    v-model="internalValue"
    :range="range"
    :format="format"
    :placeholder="resolvedPlaceholder"
    :auto-apply="resolvedAutoApply"
    :enable-time-picker="enableTimePicker"
    :clearable="resolvedClearable"
    :multi-calendars="resolvedMultiCalendars"
    class="ps-datepicker"
    @update:model-value="onUpdate"
  >
    <template #input-icon>
      <i class="bi bi-calendar3 ps-input-icon" />
    </template>
  </VueDatePicker>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps<{
  modelValue: any;
  range?: boolean;
  format?: string;
  placeholder?: string;
  autoApply?: boolean;
  enableTimePicker?: boolean;
  clearable?: boolean;
  multiCalendars?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const internalValue = ref(props.modelValue);

const resolvedPlaceholder = computed(() => {
  if (props.placeholder) {
    return props.placeholder;
  }

  return props.range ? 'Pilih rentang tanggal' : 'Pilih tanggal';
});

const resolvedAutoApply = computed(() => props.autoApply ?? true);
const resolvedClearable = computed(() => props.clearable ?? true);
const resolvedMultiCalendars = computed(() => props.multiCalendars ?? props.range ?? false);

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const onUpdate = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>
