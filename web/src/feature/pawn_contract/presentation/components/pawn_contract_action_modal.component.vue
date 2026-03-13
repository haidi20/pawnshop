<template>
  <BaseModalComponent
    :is-open="row !== null"
    @close="emit('close')"
  >
    <div class="modal-header pawn-contract-page__action-header">
      <div>
        <div class="pawn-contract-page__section-eyebrow mb-2">
          Aksi Gadai
        </div>
        <h2 class="h5 mb-1">
          {{ row?.customerName }}
        </h2>
        <p class="mb-0 text-secondary">
          {{ row?.contract.contractNumber }} - {{ row?.itemNames }}
        </p>
      </div>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="emit('close')"
      />
    </div>

    <div class="modal-body pawn-contract-page__action-body">
      <div class="pawn-contract-page__action-grid">
        <template v-if="row">
          <RouterLink
            v-for="action in linkActions"
            :key="action.key"
            class="pawn-contract-page__action-choice"
            :to="getActionRoute(action.key)"
            @click="emit('close')"
          >
            <i
              :class="getActionIconClass(action.key)"
              aria-hidden="true"
            />
            <span>{{ action.label }}</span>
          </RouterLink>

          <button
            v-for="action in buttonActions"
            :key="action.key"
            type="button"
            class="pawn-contract-page__action-choice"
            @click="handleActionClick(action.key)"
          >
            <i
              :class="getActionIconClass(action.key)"
              aria-hidden="true"
            />
            <span>{{ action.label }}</span>
          </button>
        </template>
      </div>
    </div>

    <div class="modal-footer pawn-contract-page__action-footer">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="emit('close')"
      >
        Tutup
      </button>
    </div>
  </BaseModalComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';
import type { PawnContractActionKeyModel, PawnContractSummaryModel } from '@feature/pawn_contract/domain/models';

const props = defineProps<{
  row: PawnContractSummaryModel | null;
}>();

const emit = defineEmits<{
  close: [];
  action: [key: PawnContractActionKeyModel];
}>();

const LINK_ACTION_KEYS: PawnContractActionKeyModel[] = ['edit', 'history'];

const linkActions = computed(() =>
  props.row?.availableActions?.filter((action) => LINK_ACTION_KEYS.includes(action.key)) ?? []
);
const buttonActions = computed(
  () => props.row?.availableActions?.filter((action) => !LINK_ACTION_KEYS.includes(action.key)) ?? []
);

const getActionRoute = (key: PawnContractActionKeyModel) => {
  if (!props.row) {
    return { name: 'PawnContract' as const };
  }

  switch (key) {
    case 'edit':
      return { name: 'PawnContractFormEdit' as const, params: { contractId: props.row.contract.id } };
    case 'history':
      return { name: 'PawnContractHistory' as const, params: { contractId: props.row.contract.id } };
    default:
      return { name: 'PawnContract' as const };
  }
};

const getActionIconClass = (key: PawnContractActionKeyModel): string => {
  switch (key) {
    case 'edit':
      return 'bi bi-pencil-square';
    case 'history':
      return 'bi bi-clock-history';
    case 'storage_fee':
      return 'bi bi-wallet2';
    case 'extension':
      return 'bi bi-arrow-repeat';
    case 'settlement':
      return 'bi bi-check2-circle';
    case 'auction':
      return 'bi bi-hammer';
    default:
      return 'bi bi-circle';
  }
};

const handleActionClick = (key: PawnContractActionKeyModel): void => {
  emit('action', key);
  emit('close');
};
</script>
