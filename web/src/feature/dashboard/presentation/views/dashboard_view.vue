<template>
  <LocalDbFeedbackStateComponent
    v-if="isLoading"
    state="loading"
    title="Memuat dashboard"
    description="Mengambil data transaksi gadai dari database lokal perusahaan aktif."
    note="Grafik, ringkasan, dan tabel terbaru akan tampil setelah pembacaan lokal selesai."
  />

  <LocalDbFeedbackStateComponent
    v-else-if="error"
    state="error"
    title="Gagal memuat dashboard"
    :description="error"
    note="Coba muat ulang agar pembacaan transaksi dari DB lokal diulang."
    action-label="Muat ulang"
    @action="vm.getDashboardData()"
  />

  <LocalDbFeedbackStateComponent
    v-else-if="data && totalTransactionCount === 0"
    state="empty"
    title="Belum ada transaksi untuk dashboard"
    description="Database lokal pada scope perusahaan dan cabang user aktif belum memiliki transaksi yang bisa diringkas."
    note="Jika user ini karyawan, data hanya tampil dari cabang yang sudah diatur pada assignment user."
  />

  <section
    v-else-if="data"
    class="dashboard-page"
  >
    <section class="dashboard-hero card">
      <div class="row g-4 align-items-stretch">
        <div class="col-12 col-xl-12">
          <div class="row row-cols-1 row-cols-md-2 g-3">
            <div class="col">
              <article class="dashboard-metric-card h-100">
                <div class="dashboard-metric-label">
                  Total Transaksi
                </div>
                <div class="dashboard-metric-value">
                  {{ formatCount(totalTransactionCount) }}
                </div>
                <div class="dashboard-metric-note">
                  Total seluruh transaksi gadai yang tersimpan lokal.
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-metric-card h-100">
                <div class="dashboard-metric-label">
                  Pembayaran
                </div>
                <div class="dashboard-metric-value">
                  {{ formatCount(paymentCount) }}
                </div>
                <div class="dashboard-metric-note">
                  Transaksi pembayaran kontrak gadai.
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-metric-card h-100">
                <div class="dashboard-metric-label">
                  Perpanjangan
                </div>
                <div class="dashboard-metric-value">
                  {{ formatCount(extensionCount) }}
                </div>
                <div class="dashboard-metric-note">
                  Perpanjangan jatuh tempo aktif.
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-metric-card h-100">
                <div class="dashboard-metric-label">
                  Lelang
                </div>
                <div class="dashboard-metric-value">
                  {{ formatCount(auctionCount) }}
                </div>
                <div class="dashboard-metric-note">
                  Transaksi lelang dari kontrak jatuh tempo.
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="row g-4">
      <div class="col-12 col-xxl-8">
        <article
          class="dashboard-panel card h-100"
          data-testid="dashboard-line-chart"
        >
          <div
            class="dashboard-section-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3"
          >
            <div>
              <div class="dashboard-section-eyebrow">
                Line Chart
              </div>
              <h3 class="dashboard-section-title">
                10 titik nominal transaksi gadai
              </h3>
              <p class="dashboard-section-caption">
                Urutan titik mengikuti tanggal transaksi dari yang paling lama ke yang paling baru.
              </p>
            </div>

            <div class="dashboard-section-highlight">
              {{ formatCurrency(lineSeriesTotalAmount) }}
            </div>
          </div>

          <div
            v-if="lineSeries.length"
            class="d-grid gap-3"
          >
            <div class="dashboard-line-chart-shell">
              <div class="dashboard-line-chart-scroll">
                <svg
                  class="dashboard-line-chart-svg"
                  viewBox="0 0 760 320"
                  role="img"
                  aria-label="Grafik line nominal transaksi gadai"
                >
                  <g
                    v-for="gridLine in chartGridLines"
                    :key="gridLine.key"
                  >
                    <line
                      class="dashboard-line-grid"
                      :class="{ 'is-base': gridLine.value === 0 }"
                      :x1="chartPadding.left"
                      :x2="chartWidth - chartPadding.right"
                      :y1="gridLine.y"
                      :y2="gridLine.y"
                    />
                    <text
                      class="dashboard-line-grid-label"
                      :x="chartPadding.left - 12"
                      :y="gridLine.y + 4"
                      text-anchor="end"
                    >
                      {{ formatCompactCurrency(gridLine.value) }}
                    </text>
                  </g>

                  <polyline
                    v-if="linePoints.length > 1"
                    class="dashboard-line-path"
                    :points="linePointsString"
                  />

                  <g
                    v-for="point in linePoints"
                    :key="point.key"
                  >
                    <circle
                      class="dashboard-line-point"
                      :class="getTransactionTypeClass(point.type)"
                      :cx="point.x"
                      :cy="point.y"
                      r="7"
                    >
                      <title>
                        {{ point.type }} - {{ formatCurrency(point.amount) }} - {{
                          formatTransactionDate(point.transactionDate) }}
                      </title>
                    </circle>
                  </g>
                </svg>
              </div>
            </div>

            <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xxl-4 g-3">
              <div
                v-for="point in lineSeries"
                :key="point.key"
                class="col"
              >
                <article class="dashboard-line-point-card h-100">
                  <div
                    class="dashboard-line-point-head d-flex flex-column flex-sm-row align-items-start justify-content-between gap-2"
                  >
                    <div class="dashboard-line-point-label">
                      {{ point.label }}
                    </div>
                    <span
                      class="dashboard-transaction-badge"
                      :class="getTransactionTypeClass(point.type)"
                    >
                      {{ point.type }}
                    </span>
                  </div>
                  <div class="dashboard-line-point-value">
                    {{ formatCurrency(point.amount) }}
                  </div>
                  <div class="dashboard-line-point-date">
                    {{ formatMiniDate(point.transactionDate) }}
                  </div>
                </article>
              </div>
            </div>
          </div>

          <LocalDbFeedbackStateComponent
            v-else
            state="empty"
            title="Belum ada titik transaksi"
            description="Grafik line akan muncul setelah transaksi lokal tersedia."
            note="Tambahkan transaksi gadai atau pilih user dengan akses cabang yang memiliki data."
            :framed="false"
            compact
          />
        </article>
      </div>

      <div class="col-12 col-xxl-4">
        <article
          class="dashboard-panel card h-100"
          data-testid="dashboard-summary"
        >
          <div
            class="dashboard-section-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3"
          >
            <div>
              <div class="dashboard-section-eyebrow">
                Insight Angka
              </div>
              <h3 class="dashboard-section-title">
                Ringkasan cepat nominal dan komposisi
              </h3>
              <p class="dashboard-section-caption">
                Semua angka di panel ini hanya menghitung transaksi gadai lokal.
              </p>
            </div>

            <div class="dashboard-section-highlight">
              {{ trendLabel }}
            </div>
          </div>

          <div class="row row-cols-1 row-cols-md-2 row-cols-xxl-1 g-3 mb-3">
            <div class="col">
              <article class="dashboard-insight-card h-100">
                <div class="dashboard-insight-label">
                  Total nominal 10 titik
                </div>
                <div class="dashboard-insight-value">
                  {{ formatCurrency(lineSeriesTotalAmount) }}
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-insight-card h-100">
                <div class="dashboard-insight-label">
                  Rata-rata nominal
                </div>
                <div class="dashboard-insight-value">
                  {{ formatCurrency(averageAmount) }}
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-insight-card h-100">
                <div class="dashboard-insight-label">
                  Puncak nominal
                </div>
                <div class="dashboard-insight-value">
                  {{ peakPoint ? formatCurrency(peakPoint.amount) : '-' }}
                </div>
                <div
                  v-if="peakPoint"
                  class="dashboard-insight-note"
                >
                  {{ formatMiniDate(peakPoint.transactionDate) }}
                </div>
              </article>
            </div>

            <div class="col">
              <article class="dashboard-insight-card h-100">
                <div class="dashboard-insight-label">
                  Perubahan awal ke akhir
                </div>
                <div class="dashboard-insight-value">
                  {{ lineSeries.length > 1 ? formatSignedCurrency(amountDelta) : '-' }}
                </div>
                <div
                  v-if="lineSeries.length > 1"
                  class="dashboard-insight-note"
                >
                  {{ formatMiniDate(lineSeries[0].transactionDate) }} ke
                  {{ formatMiniDate(lineSeries[lineSeries.length - 1].transactionDate) }}
                </div>
              </article>
            </div>
          </div>

          <div class="dashboard-breakdown-list">
            <article
              v-for="item in chartItems"
              :key="item.key"
              class="dashboard-breakdown-item"
            >
              <div
                class="dashboard-breakdown-meta d-flex flex-column flex-sm-row align-items-start justify-content-between gap-2"
              >
                <div>
                  <div class="dashboard-breakdown-label">
                    {{ item.label }}
                  </div>
                  <div class="dashboard-breakdown-note">
                    {{ typeShare(item.count) }} dari total transaksi
                  </div>
                </div>
                <div class="dashboard-breakdown-value">
                  {{ formatCount(item.count) }}
                </div>
              </div>

              <div class="dashboard-breakdown-bar">
                <div
                  class="dashboard-breakdown-fill"
                  :class="getBreakdownClass(item.key)"
                  :style="{ width: `${typePercentage(item.count)}%` }"
                />
              </div>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section
      class="dashboard-panel card"
      data-testid="dashboard-recent-transactions"
    >
      <div
        class="dashboard-section-head d-flex flex-column flex-lg-row align-items-start justify-content-between gap-3"
      >
        <div>
          <div class="dashboard-section-eyebrow">
            Recent Transactions
          </div>
          <h3 class="dashboard-section-title">
            5 transaksi gadai terbaru
          </h3>
          <p class="dashboard-section-caption">
            Data diurutkan dari transaksi terbaru yang tersimpan di database lokal.
          </p>
        </div>

        <div
          v-if="latestTransaction"
          class="dashboard-section-highlight"
        >
          {{ formatMiniDate(latestTransaction.transactionDate) }}
        </div>
      </div>

      <div class="dashboard-transaction-summary d-flex flex-wrap gap-2">
        <div class="dashboard-transaction-summary-item">
          Pembayaran <strong>{{ formatCount(paymentCount) }}</strong>
        </div>
        <div class="dashboard-transaction-summary-item">
          Perpanjangan <strong>{{ formatCount(extensionCount) }}</strong>
        </div>
        <div class="dashboard-transaction-summary-item">
          Lelang <strong>{{ formatCount(auctionCount) }}</strong>
        </div>
      </div>

      <div
        v-if="recentTransactions.length"
        class="table-responsive dashboard-transaction-table-wrap"
      >
        <table class="table align-middle mb-0 dashboard-transaction-table">
          <thead>
            <tr>
              <th>Tipe</th>
              <th>Referensi</th>
              <th>Kontrak</th>
              <th>Tanggal</th>
              <th>Nominal</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="transaction in recentTransactions"
              :key="transaction.key"
            >
              <td>
                <span
                  class="dashboard-transaction-badge"
                  :class="getTransactionTypeClass(transaction.type)"
                >
                  {{ transaction.type }}
                </span>
              </td>
              <td class="dashboard-transaction-reference">
                {{ transaction.reference }}
              </td>
              <td>Kontrak #{{ transaction.contractId }}</td>
              <td>{{ formatTransactionDate(transaction.transactionDate) }}</td>
              <td class="dashboard-transaction-amount">
                {{ formatCurrency(transaction.amount) }}
              </td>
              <td>{{ transaction.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <LocalDbFeedbackStateComponent
        v-else
        state="empty"
        title="Belum ada transaksi terbaru"
        description="Tabel ini akan menampilkan lima transaksi terakhir dari database lokal."
        note="Data akan terisi setelah pembayaran, perpanjangan, atau lelang mulai tercatat."
        :framed="false"
        compact
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import LocalDbFeedbackStateComponent from '@core/presentation/components/local_db_feedback_state.component.vue';
import type {
  DashboardLinePointModel,
  DashboardRecentTransactionModel
} from '@feature/dashboard/domain/models';
import '@feature/dashboard/presentation/styles/dashboard_base.css';
import { dashboardViewModel } from '@feature/dashboard/presentation/view_models/dashboard.vm';

interface DashboardLineCoordinate extends DashboardLinePointModel {
  x: number;
  y: number;
}

const vm = dashboardViewModel();
const { data, isLoading, error } = storeToRefs(vm);

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const countFormatter = new Intl.NumberFormat('id-ID');
const fullDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});
const miniDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short'
});

const chartWidth = 760;
const chartHeight = 320;
const chartPadding = {
  top: 20,
  right: 24,
  bottom: 28,
  left: 84
};

const chartItems = computed(() => data.value?.chartItems ?? []);
const lineSeries = computed(() => data.value?.lineSeries ?? []);
const recentTransactions = computed(() => data.value?.recentTransactions ?? []);

const getCountByKey = (key: string): number =>
  chartItems.value.find((item) => item.key === key)?.count ?? 0;

const totalTransactionCount = computed(() =>
  chartItems.value.reduce((total, item) => total + item.count, 0)
);
const paymentCount = computed(() => getCountByKey('contract_payments'));
const extensionCount = computed(() => getCountByKey('contract_extensions'));
const auctionCount = computed(() => getCountByKey('auction_transactions'));

const lineSeriesTotalAmount = computed(() =>
  lineSeries.value.reduce((total, point) => total + point.amount, 0)
);
const averageAmount = computed(() =>
  lineSeries.value.length ? Math.round(lineSeriesTotalAmount.value / lineSeries.value.length) : 0
);
const peakPoint = computed<DashboardLinePointModel | null>(() =>
  lineSeries.value.reduce<DashboardLinePointModel | null>((highest, point) => {
    if (!highest || point.amount > highest.amount) {
      return point;
    }

    return highest;
  }, null)
);
const latestTransaction = computed<DashboardRecentTransactionModel | null>(
  () => recentTransactions.value[0] ?? null
);

const amountDelta = computed(() => {
  if (lineSeries.value.length < 2) {
    return 0;
  }

  const firstAmount = lineSeries.value[0]?.amount ?? 0;
  const lastAmount = lineSeries.value[lineSeries.value.length - 1]?.amount ?? 0;
  return lastAmount - firstAmount;
});

const trendLabel = computed(() => {
  if (lineSeries.value.length < 2) {
    return 'Belum cukup data';
  }

  if (amountDelta.value > 0) {
    return 'Tren naik';
  }

  if (amountDelta.value < 0) {
    return 'Tren turun';
  }

  return 'Tren stabil';
});

const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

const chartMaxAmount = computed(() => Math.max(...lineSeries.value.map((point) => point.amount), 1));

const chartGridLines = computed(() =>
  [1, 0.75, 0.5, 0.25, 0].map((step) => ({
    key: `grid-${step}`,
    value: Math.round(chartMaxAmount.value * step),
    y: chartPadding.top + chartInnerHeight - chartInnerHeight * step
  }))
);

const linePoints = computed<DashboardLineCoordinate[]>(() => {
  if (!lineSeries.value.length) {
    return [];
  }

  return lineSeries.value.map((point, index, series) => {
    const denominator = series.length > 1 ? series.length - 1 : 1;
    const x =
      series.length === 1
        ? chartPadding.left + chartInnerWidth / 2
        : chartPadding.left + (chartInnerWidth * index) / denominator;
    const y =
      chartPadding.top + chartInnerHeight - (point.amount / chartMaxAmount.value) * chartInnerHeight;

    return {
      ...point,
      x,
      y
    };
  });
});

const linePointsString = computed(() =>
  linePoints.value.map((point) => `${point.x},${point.y}`).join(' ')
);

const parseDate = (value: string): Date => {
  const normalizedValue = value.includes(' ') ? value.replace(' ', 'T') : `${value}T00:00:00`;
  return new Date(normalizedValue);
};

const formatCurrency = (value: number): string => currencyFormatter.format(value);
const formatCompactCurrency = (value: number): string => compactCurrencyFormatter.format(value);
const formatCount = (value: number): string => countFormatter.format(value);
const formatTransactionDate = (value: string): string => fullDateFormatter.format(parseDate(value));
const formatMiniDate = (value: string): string => miniDateFormatter.format(parseDate(value));
const formatSignedCurrency = (value: number): string =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${currencyFormatter.format(Math.abs(value))}`;

const typePercentage = (count: number): number => {
  if (!totalTransactionCount.value) {
    return 0;
  }

  return Number(((count / totalTransactionCount.value) * 100).toFixed(1));
};

const typeShare = (count: number): string => `${typePercentage(count).toFixed(1)}%`;

const getTransactionTypeClass = (
  type: DashboardLinePointModel['type'] | DashboardRecentTransactionModel['type']
): string => {
  if (type === 'Pembayaran') {
    return 'is-payment';
  }

  if (type === 'Perpanjangan') {
    return 'is-extension';
  }

  return 'is-auction';
};

const getBreakdownClass = (key: string): string => {
  if (key === 'contract_payments') {
    return 'is-payment';
  }

  if (key === 'contract_extensions') {
    return 'is-extension';
  }

  return 'is-auction';
};

onMounted(() => {
  void vm.getDashboardData();
});
</script>
