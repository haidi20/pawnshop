<template>
  <div class="ps-datatable card">
    <div class="ps-datatable__toolbar">
      <div class="ps-datatable__toolbar-left">
        <div class="ps-datatable__entries">
          <span>Tampilkan</span>
          <select
            v-model="limitModel"
            class="form-select ps-field"
            @change="onLimitChange"
          >
            <option
              v-for="option in vmData.limitOptions"
              :key="option"
              :value="option"
            >
              {{ formatLimitOption(option) }}
            </option>
          </select>
          <span>baris</span>
        </div>

        <slot name="extra-actions" />
      </div>

      <div class="ps-datatable__toolbar-right">
        <form
          class="ps-datatable__search"
          @submit.prevent="vm.searchData()"
        >
          <i class="bi bi-search ps-datatable__search-icon" />
          <input
            v-model="searchModel"
            type="search"
            class="ps-datatable__search-input"
            :placeholder="searchPlaceholder"
            @input="vm.searchData()"
          >
          <button
            class="btn btn-primary ps-datatable__search-submit"
            type="submit"
          >
            <i class="bi bi-funnel" />
            <span>Filter</span>
          </button>
        </form>
      </div>
    </div>

    <div class="ps-datatable__surface">
      <div class="ps-datatable__table-wrap">
        <table class="table table-hover align-middle ps-datatable__table">
          <thead v-if="hasCustomHead">
            <slot
              name="head"
              :fields="normalizedFields"
            />
          </thead>
          <thead v-else>
            <tr>
              <th
                v-for="field in normalizedFields"
                :key="field.key"
                :class="field.thClass"
              >
                <slot
                  :name="`head(${field.key})`"
                  :field="field"
                >
                  {{ field.label }}
                </slot>
              </th>
            </tr>
          </thead>

          <tbody v-if="hasCustomBody && vmData.items.length > 0">
            <template
              v-for="(item, index) in vmData.items"
              :key="getRowKey(item, index)"
            >
              <slot
                name="body"
                :item="item"
                :index="index"
                :fields="normalizedFields"
              />
            </template>
          </tbody>
          <tbody v-else-if="vmData.items.length > 0">
            <tr
              v-for="(item, index) in vmData.items"
              :key="getRowKey(item, index)"
            >
              <td
                v-for="field in normalizedFields"
                :key="field.key"
                :class="field.tdClass"
                :data-label="field.label"
              >
                <slot
                  :name="`cell(${field.key})`"
                  :item="item"
                  :field="field"
                  :index="index"
                  :value="getCellValue(item, field.key)"
                >
                  {{ formatCellValue(item, field) }}
                </slot>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td
                :colspan="Math.max(normalizedFields.length, 1)"
                class="ps-datatable__empty-cell"
              >
                <slot name="empty">
                  <div class="ps-datatable__empty-state">
                    <span class="ps-datatable__empty-icon">
                      <i class="bi bi-folder2-open" />
                    </span>
                    <div class="ps-datatable__empty-title">
                      {{ emptyStateTitle }}
                    </div>
                    <p class="ps-datatable__empty-note">
                      {{ emptyStateNote }}
                    </p>
                  </div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="vmData.loading"
        class="ps-datatable__overlay"
      >
        <div class="ps-datatable__overlay-card">
          <div
            class="spinner-border text-primary"
            role="status"
            aria-hidden="true"
          />
          <div class="ps-datatable__overlay-copy">
            <div class="ps-datatable__overlay-title">
              Memproses tampilan tabel
            </div>
            <div>Filter lokal dan pagination sedang diperbarui.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="ps-datatable__footer">
      <div class="ps-datatable__summary">
        <template v-if="vmData.totalItems > 0">
          Menampilkan {{ rangeStart }}-{{ rangeEnd }} dari {{ vmData.totalItems }} data
        </template>
        <template v-else>
          Belum ada data yang bisa ditampilkan.
        </template>
      </div>

      <div
        v-if="vmData.totalPages > 1"
        class="ps-datatable__pagination"
      >
        <button
          type="button"
          class="ps-datatable__page-btn"
          :disabled="vmData.currentPage === 1"
          @click="vm.changePage(1)"
        >
          <i class="bi bi-chevron-double-left" />
        </button>
        <button
          type="button"
          class="ps-datatable__page-btn"
          :disabled="vmData.currentPage === 1"
          @click="vm.changePage(vmData.currentPage - 1)"
        >
          <i class="bi bi-chevron-left" />
        </button>
        <button
          v-for="page in vmData.pageNumbers"
          :key="`${page}`"
          type="button"
          class="ps-datatable__page-btn"
          :class="{
            'is-active': page === vmData.currentPage,
            'is-gap': page === '...',
          }"
          :disabled="page === '...'"
          @click="typeof page === 'number' ? vm.changePage(page) : undefined"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="ps-datatable__page-btn"
          :disabled="vmData.currentPage === vmData.totalPages"
          @click="vm.changePage(vmData.currentPage + 1)"
        >
          <i class="bi bi-chevron-right" />
        </button>
        <button
          type="button"
          class="ps-datatable__page-btn"
          :disabled="vmData.currentPage === vmData.totalPages"
          @click="vm.changePage(vmData.totalPages)"
        >
          <i class="bi bi-chevron-double-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, isRef, useSlots } from 'vue';

import type { DataTableClientSideVM } from '@/core/presentation/view_models/datatable_clientside.vm';

type TableField<T> = {
  key: string;
  label?: string;
  formatter?: (value: unknown, key: string, item: T) => unknown;
  thClass?: string;
  tdClass?: string;
};

const props = defineProps<{
  vm: DataTableClientSideVM<T>;
}>();

defineSlots<{
  [key: string]: ((props: any) => any) | undefined;
  head?: (props: { fields: TableField<T>[] }) => any;
  body?: (props: { item: T; index: number; fields: TableField<T>[] }) => any;
  empty?: () => any;
  'extra-actions'?: () => any;
}>();

const slots = useSlots();

const unwrap = <V,>(value: V): V extends { value: infer TValue } ? TValue : V => {
  return (isRef(value) ? value.value : value) as any;
};

const prettifyLabel = (key: string): string => {
  return (
    key
      .split('.')
      .pop()
      ?.replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()) ?? key
  );
};

const getCellValue = (item: T, key: string): unknown => {
  return key.split('.').reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }

    return (acc as Record<string, unknown>)[segment];
  }, item);
};

const normalizeField = (field: any): TableField<T> => {
  if (typeof field === 'string') {
    return {
      key: field,
      label: prettifyLabel(field),
    };
  }

  return {
    key: field.key,
    label: field.label || prettifyLabel(field.key),
    formatter: field.formatter,
    thClass: field.thClass,
    tdClass: field.tdClass,
  };
};

const vmData = computed(() => ({
  items: unwrap(props.vm.items),
  loading: unwrap(props.vm.loading),
  search: unwrap(props.vm.search),
  offset: unwrap(props.vm.offset),
  limit: unwrap(props.vm.limit),
  totalItems: unwrap(props.vm.totalItems),
  fields: props.vm.fields,
  limitOptions: unwrap(props.vm.limitOptions),
  totalPages: unwrap(props.vm.totalPages),
  currentPage: unwrap(props.vm.currentPage),
  pageNumbers: unwrap(props.vm.pageNumbers),
}));

const normalizedFields = computed<TableField<T>[]>(() => {
  if (vmData.value.fields.length > 0) {
    return vmData.value.fields.map(normalizeField);
  }

  const [firstItem] = vmData.value.items;
  if (!firstItem) {
    return [];
  }

  return Object.keys(firstItem).map((key) =>
    normalizeField({
      key,
      label: prettifyLabel(key),
    })
  );
});

const hasCustomHead = computed(() => Boolean(slots.head));
const hasCustomBody = computed(() => Boolean(slots.body));
const rangeStart = computed(() => (vmData.value.totalItems > 0 ? vmData.value.offset + 1 : 0));
const rangeEnd = computed(() =>
  vmData.value.totalItems > 0
    ? Math.min(vmData.value.offset + vmData.value.items.length, vmData.value.totalItems)
    : 0
);
const emptyStateTitle = computed(() =>
  vmData.value.search ? 'Tidak ada data yang cocok' : 'Belum ada data tersedia'
);
const emptyStateNote = computed(() =>
  vmData.value.search
    ? 'Ubah kata kunci pencarian agar hasil yang tampil lebih relevan.'
    : 'Isi tabel akan muncul otomatis setelah data dimuat ke komponen ini.'
);
const searchPlaceholder = computed(() =>
  normalizedFields.value.length > 0 ? 'Filter data secara instan...' : 'Cari data...'
);
const limitModel = computed({
  get: () => vmData.value.limit,
  set: (value: number | string) => {
    props.vm.setLimit(Number(value));
  },
});
const searchModel = computed({
  get: () => vmData.value.search,
  set: (value: string) => {
    props.vm.setSearch(value);
  },
});

const onLimitChange = () => {
  props.vm.searchData();
};

const formatLimitOption = (option: number): string => {
  return option === vmData.value.totalItems && option > 25 ? 'Semua' : `${option}`;
};

const formatCellValue = (item: T, field: TableField<T>): unknown => {
  const rawValue = getCellValue(item, field.key);

  if (field.formatter) {
    return field.formatter(rawValue, field.key, item);
  }

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return '-';
  }

  if (Array.isArray(rawValue)) {
    return rawValue.join(', ');
  }

  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Ya' : 'Tidak';
  }

  return rawValue;
};

const getRowKey = (item: T, index: number): string | number => {
  return ((item as Record<string, unknown>).id ??
    (item as Record<string, unknown>).uuid ??
    (item as Record<string, unknown>).code ??
    index) as string | number;
};
</script>
