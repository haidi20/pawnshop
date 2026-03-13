<template>
  <template v-if="isOpen">
    <section
      class="modal fade show d-block pawn-contract-page__filter-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pawn-contract-filter-modal-title"
      @click.self="emit('close')"
    >
      <div class="modal-dialog modal-dialog-centered pawn-contract-page__filter-dialog">
        <div class="modal-content border-0 pawn-contract-page__filter-content">
          <div class="modal-header pawn-contract-page__filter-header">
            <div>
              <div class="pawn-contract-page__section-eyebrow mb-2">
                Filter Tabel
              </div>
              <h2
                id="pawn-contract-filter-modal-title"
                class="h5 mb-1"
              >
                Filter index gadai
              </h2>
              <p class="mb-0 text-secondary">
                Pilih cabang dan status kontrak untuk mempersempit data pada tabel.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="emit('close')"
            />
          </div>

          <div class="modal-body pawn-contract-page__filter-body">
            <div class="row g-3">
              <div class="col-12">
                <label
                  class="form-label fw-semibold"
                  for="pawn-contract-table-branch-filter"
                >Cabang</label>
                <select
                  id="pawn-contract-table-branch-filter"
                  v-model="draftBranchFilter"
                  class="form-select"
                  :disabled="isBranchLocked"
                >
                  <option
                    v-if="allowAllBranches"
                    value="all"
                  >
                    Semua cabang
                  </option>
                  <option
                    v-else-if="branches.length === 0"
                    value=""
                  >
                    Belum ada cabang akses
                  </option>
                  <option
                    v-for="branch in branches"
                    :key="branch.id"
                    :value="String(branch.id)"
                  >
                    {{ branch.branchName }}
                  </option>
                </select>
                <small
                  v-if="isBranchLocked"
                  class="text-secondary"
                >
                  Cabang user ini dikunci sesuai assignment owner.
                </small>
              </div>

              <div class="col-12">
                <label
                  class="form-label fw-semibold"
                  for="pawn-contract-table-status-filter"
                >Status kontrak</label>
                <select
                  id="pawn-contract-table-status-filter"
                  v-model="draftStatusFilter"
                  class="form-select"
                >
                  <option value="all">
                    Semua status
                  </option>
                  <option
                    v-for="status in statusOptions"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer pawn-contract-page__filter-footer">
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="emit('close')"
            >
              Tutup
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="!hasDraftOrAppliedFilters"
              @click="emit('reset')"
            >
              Reset
            </button>
            <button
              class="btn btn-primary"
              type="button"
              @click="applyFilters()"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </section>
    <div
      class="modal-backdrop fade show pawn-contract-page__filter-backdrop"
      @click="emit('close')"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { PawnContractStatusModel } from '@core/util/helpers';

interface PawnContractFilterBranchOption {
  id: number | string;
  branchName: string;
}

interface PawnContractFilterStatusOption {
  value: PawnContractStatusModel;
  label: string;
}

const props = defineProps<{
  isOpen: boolean;
  branches: PawnContractFilterBranchOption[];
  statusOptions: PawnContractFilterStatusOption[];
  branchFilter: string;
  statusFilter: 'all' | PawnContractStatusModel;
  hasActiveFilters: boolean;
  allowAllBranches: boolean;
  isBranchLocked: boolean;
}>();

const emit = defineEmits<{
  close: [];
  reset: [];
  apply: [payload: { branchFilter: string; statusFilter: 'all' | PawnContractStatusModel }];
}>();

const draftBranchFilter = ref('all');
const draftStatusFilter = ref<'all' | PawnContractStatusModel>('all');

const syncDraftFilters = (): void => {
  draftBranchFilter.value = props.isBranchLocked && props.branches.length > 0
    ? String(props.branches[0]?.id ?? '')
    : props.branchFilter;
  draftStatusFilter.value = props.statusFilter;
};

const hasDraftOrAppliedFilters = computed(
  () =>
    props.hasActiveFilters ||
    draftBranchFilter.value !== 'all' ||
    draftStatusFilter.value !== 'all'
);

const applyFilters = (): void => {
  emit('apply', {
    branchFilter: draftBranchFilter.value,
    statusFilter: draftStatusFilter.value
  });
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      syncDraftFilters();
    }
  },
  { immediate: true }
);
</script>
