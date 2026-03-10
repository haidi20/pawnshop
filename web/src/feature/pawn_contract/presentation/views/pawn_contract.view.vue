<template>
  <section v-if="isLoading" class="card p-4">
    <div class="d-flex align-items-center gap-3">
      <div class="spinner-border text-primary" role="status" aria-hidden="true" />
      <div>
        <div class="fw-bold">Loading Pawn Contract</div>
        <div class="text-secondary">Menyiapkan struktur feature berdasarkan SQL.</div>
      </div>
    </div>
  </section>

  <section v-else-if="error" class="card p-4">
    <div class="fw-bold text-danger mb-2">Feature load failed</div>
    <p class="mb-3 text-secondary">{{ error }}</p>
    <button class="btn btn-primary" type="button" @click="vm.getPawnContractData()">
      Muat ulang
    </button>
  </section>

  <FeatureDataPage v-else-if="data" :data="data" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import FeatureDataPage from '@core/presentation/components/feature_data_page.view.vue';
import { pawnContractViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract.vm';

const vm = pawnContractViewModel();
const { data, isLoading, error } = storeToRefs(vm);

onMounted(() => {
  void vm.getPawnContractData();
});
</script>
