<template>
  <section v-if="isLoading" class="card p-4">
    <div class="d-flex align-items-center gap-3">
      <div class="spinner-border text-primary" role="status" aria-hidden="true" />
      <div>
        <div class="fw-bold">Loading Master Investor</div>
        <div class="text-secondary">Mengambil data lokal dari DAO feature.</div>
      </div>
    </div>
  </section>

  <section v-else-if="error" class="card p-4">
    <div class="fw-bold text-danger mb-2">Feature load failed</div>
    <p class="mb-3 text-secondary">{{ error }}</p>
    <button class="btn btn-primary" type="button" @click="vm.getMasterInvestorData()">
      Muat ulang
    </button>
  </section>

  <FeatureDataPage v-else-if="data" :data="data" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import FeatureDataPage from '@core/presentation/components/feature_data_page.view.vue';
import { masterInvestorViewModel } from '@feature/master_investor/presentation/view_models/master_investor.vm';

const vm = masterInvestorViewModel();
const { data, isLoading, error } = storeToRefs(vm);

onMounted(() => {
    void vm.getMasterInvestorData();
});
</script>
