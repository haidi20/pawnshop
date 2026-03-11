<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading"
    state="loading"
    title="Memuat history gadai"
    description="Mengambil riwayat kontrak dan perpindahan barang dari database lokal."
    note="Timeline akan dirangkai setelah VM menerima data dari usecase dan repository lokal."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error"
    state="error"
    title="Gagal memuat history gadai"
    :description="error"
    note="Coba muat ulang agar data kontrak dan mutasi barang dari DB lokal dibaca kembali."
  >
    <template #actions>
      <button
        class="btn btn-primary"
        type="button"
        @click="reloadData()"
      >
        Muat ulang
      </button>
      <RouterLink
        class="btn btn-outline-secondary"
        :to="{ name: 'PawnContract' }"
      >
        Kembali ke data gadai
      </RouterLink>
    </template>
  </LocalDbFeedbackStateComponent>

  <section
    v-else-if="summary"
    class="pawn-contract-page pawn-contract-history-page"
  >
    <section class="card border-0 shadow-sm pawn-contract-page__overview">
      <div class="card-body p-3">
        <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-start gap-3">
          <div class="pawn-contract-page__toolbar-copy">
            <div class="pawn-contract-page__section-eyebrow">
              History Gadai
            </div>
            <h1 class="pawn-contract-page__toolbar-title mb-1">
              {{ summary.customerName }}
            </h1>
            <p class="pawn-contract-page__section-summary mb-0">
              {{ summary.contract.contractNumber }} | {{ summary.itemNames }}
            </p>
          </div>

          <div class="pawn-contract-history-page__toolbar-actions">
            <span
              class="status-badge"
              :class="getContractStatusClass(summary.contract.contractStatus)"
            >
              {{ getContractStatusLabel(summary.contract.contractStatus) }}
            </span>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="goBack()"
            >
              Kembali
            </button>
            <RouterLink
              class="btn btn-primary"
              :to="{ name: 'PawnContractFormEdit', params: { contractId: summary.contract.id } }"
            >
              Ubah data
            </RouterLink>
          </div>
        </div>

        <div class="pawn-contract-page__totals pawn-contract-page__totals--overview">
          <article class="pawn-contract-page__total-item">
            <span>Cabang</span>
            <strong>{{ summary.branchName }}</strong>
          </article>
          <article class="pawn-contract-page__total-item">
            <span>Jatuh tempo</span>
            <strong>{{ formatDate(summary.contract.maturityDate) }}</strong>
          </article>
          <article class="pawn-contract-page__total-item">
            <span>Lokasi barang</span>
            <strong>{{ summary.locationLabel }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="card border-0 shadow-sm pawn-contract-page__overview">
      <div class="card-body p-3">
        <div class="mb-3">
          <div class="pawn-contract-page__section-eyebrow">
            Timeline
          </div>
          <h2 class="pawn-contract-page__section-title mb-1">
            Riwayat aktivitas
          </h2>
          <p class="pawn-contract-page__section-summary mb-0">
            Tampilkan perubahan utama kontrak, jatuh tempo, dan perpindahan barang jaminan.
          </p>
        </div>

        <div
          v-if="timelineEntries.length > 0"
          class="pawn-contract-history-page__timeline"
        >
          <article
            v-for="entry in timelineEntries"
            :key="entry.key"
            class="pawn-contract-history-page__timeline-item"
          >
            <div class="pawn-contract-history-page__timeline-date">
              {{ formatDateTime(entry.occurredAt) }}
            </div>
            <div class="pawn-contract-history-page__timeline-content">
              <h3 class="pawn-contract-page__table-title mb-1">
                {{ entry.title }}
              </h3>
              <p class="text-secondary mb-0">
                {{ entry.description }}
              </p>

              <div
                v-if="entry.meta.length > 0"
                class="pawn-contract-history-page__timeline-meta"
              >
                <article
                  v-for="item in entry.meta"
                  :key="`${entry.key}-${item.label}`"
                  class="pawn-contract-history-page__timeline-meta-item"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </div>
          </article>
        </div>

        <LocalDbFeedbackStateComponent
          v-else
          state="empty"
          title="Belum ada riwayat tambahan"
          description="Timeline tambahan akan muncul saat ada perubahan kontrak atau mutasi barang berikutnya."
          note="Data history tetap dibatasi oleh perusahaan aktif dan cabang user yang berhak mengakses."
          :framed="false"
          compact
        />
      </div>
    </section>

    <section class="card border-0 shadow-sm pawn-contract-page__overview">
      <div class="card-body p-3">
        <div class="mb-3">
          <div class="pawn-contract-page__section-eyebrow">
            Barang
          </div>
          <h2 class="pawn-contract-page__section-title mb-1">
            Ringkasan barang jaminan
          </h2>
          <p class="pawn-contract-page__section-summary mb-0">
            Posisi terakhir, jumlah mutasi, dan nilai taksiran tiap barang pada kontrak ini.
          </p>
        </div>

        <div class="pawn-contract-history-page__item-grid">
          <article
            v-for="itemDetail in summary.items"
            :key="itemDetail.item.id"
            class="pawn-contract-history-page__item-card"
          >
            <div class="d-flex flex-wrap justify-content-between gap-2 align-items-start">
              <div>
                <h3 class="pawn-contract-page__table-title mb-1">
                  {{ itemDetail.item.itemName }}
                </h3>
                <p class="text-secondary mb-0">
                  Qty {{ itemDetail.item.quantity }} | {{ formatCurrency(itemDetail.item.appraisedValue) }}
                </p>
              </div>
              <span
                class="status-badge"
                :class="getLocationStatusClass(itemDetail.item.currentLocationStatus)"
              >
                {{ getLocationStatusLabel(itemDetail.item.currentLocationStatus) }}
              </span>
            </div>

            <div class="pawn-contract-history-page__timeline-meta">
              <article class="pawn-contract-history-page__timeline-meta-item">
                <span>Mutasi</span>
                <strong>{{ formatCount(itemDetail.locationMovements.length) }}</strong>
              </article>
              <article class="pawn-contract-history-page__timeline-meta-item">
                <span>Aksesori</span>
                <strong>{{ formatCount(itemDetail.accessories.length) }}</strong>
              </article>
              <article class="pawn-contract-history-page__timeline-meta-item">
                <span>Catatan kerusakan</span>
                <strong>{{ formatCount(itemDetail.issues.length) }}</strong>
              </article>
            </div>
          </article>
        </div>
      </div>
    </section>
  </section>

  <LocalDbFeedbackStateComponent
    v-else
    state="empty"
    title="Kontrak tidak ditemukan"
    description="Data kontrak yang diminta tidak tersedia pada perusahaan aktif atau berada di luar akses cabang user."
    note="Pastikan nomor kontrak benar dan user ini memang berhak melihat cabang tersebut."
  >
    <template #actions>
      <RouterLink
        class="btn btn-primary"
        :to="{ name: 'PawnContract' }"
      >
        Kembali ke data gadai
      </RouterLink>
    </template>
  </LocalDbFeedbackStateComponent>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute } from 'vue-router';
import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import '@feature/pawn_contract/presentation/styles/pawn_contract.css';
import { pawnContractHistoryViewModel } from '@feature/pawn_contract/presentation/view_models/pawn_contract_history.vm';

const route = useRoute();
const vm = pawnContractHistoryViewModel();
const { isLoading, error, summary, timelineEntries } = storeToRefs(vm);
const {
  formatDate,
  formatDateTime,
  formatCount,
  formatCurrency,
  getContractStatusLabel,
  getContractStatusClass,
  getLocationStatusLabel,
  getLocationStatusClass,
  goBack,
  loadByRouteParam,
  reloadData,
  resetState
} = vm;

watch(() => route.params.contractId, (contractId) => {
  void loadByRouteParam(contractId as string | string[] | undefined);
}, { immediate: true });

onBeforeUnmount(() => {
  resetState();
});
</script>
