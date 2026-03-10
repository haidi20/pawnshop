<template>
  <div
    class="pawn-contract-create-page__confirm-layout text-start"
    data-testid="pawn-contract-submit-confirmation"
  >
    <section
      v-for="section in sections"
      :key="section.id"
      class="pawn-contract-create-page__confirm-panel"
      :data-testid="`pawn-contract-submit-section-${section.id}`"
    >
      <div class="pawn-contract-create-page__confirm-panel-head">
        <div class="pawn-contract-create-page__confirm-panel-icon">
          <i
            :class="section.iconClass"
            aria-hidden="true"
          />
        </div>
        <div class="pawn-contract-create-page__confirm-panel-copy">
          <div class="pawn-contract-create-page__section-kicker">
            {{ section.kicker }}
          </div>
          <h2 class="pawn-contract-create-page__sidebar-title">
            {{ section.title }}
          </h2>
          <p class="text-muted mb-0">
            {{ section.description }}
          </p>
        </div>
      </div>

      <div class="pawn-contract-create-page__summary-list mt-4">
        <div
          v-for="row in section.rows"
          :key="row.key"
          class="pawn-contract-create-page__summary-item"
          :data-testid="`pawn-contract-submit-row-${section.id}-${row.key}`"
        >
          <div class="pawn-contract-create-page__summary-item-copy">
            <span>{{ row.label }}</span>
            <small
              v-if="row.helper"
              class="pawn-contract-create-page__summary-item-helper"
            >{{ row.helper }}</small>
          </div>
          <strong>{{ row.value }}</strong>
        </div>
      </div>
    </section>

    <section
      class="pawn-contract-create-page__confirm-panel"
      data-testid="pawn-contract-submit-section-status"
    >
      <div class="pawn-contract-create-page__confirm-panel-head">
        <div class="pawn-contract-create-page__confirm-panel-icon is-status">
          <i
            class="bi bi-shield-check"
            aria-hidden="true"
          />
        </div>
        <div class="pawn-contract-create-page__confirm-panel-copy">
          <div class="pawn-contract-create-page__section-kicker">
            Status pengecekan
          </div>
          <h2 class="pawn-contract-create-page__sidebar-title">
            Validasi akhir sebelum simpan
          </h2>
          <p class="text-muted mb-0">
            Sistem menampilkan kondisi dana dan pengecekan utama agar petugas bisa memutuskan dengan cepat.
          </p>
        </div>
      </div>

      <div class="pawn-contract-create-page__status-card mt-4">
        <div class="pawn-contract-create-page__status-head">
          <strong>Status transaksi</strong>
          <span :class="hasEnoughBalance ? 'text-primary' : 'text-danger'">
            {{ statusLabel }}
          </span>
        </div>
        <ul class="mb-0 pawn-contract-create-page__status-checklist">
          <li>
            <i
              class="bi bi-check2-circle"
              aria-hidden="true"
            />
            Dana pencairan tidak boleh lebih besar dari nilai taksiran.
          </li>
          <li>
            <i
              class="bi bi-check2-circle"
              aria-hidden="true"
            />
            Saldo kas cabang dicek ulang sebelum data disimpan.
          </li>
          <li>
            <i
              class="bi bi-check2-circle"
              aria-hidden="true"
            />
            Data nasabah lama akan dipakai otomatis jika cocok.
          </li>
        </ul>
      </div>

      <div
        class="pawn-contract-create-page__confirm-balance mt-4"
        :class="hasEnoughBalance ? 'is-safe' : 'is-danger'"
        data-testid="pawn-contract-submit-balance"
      >
        <div class="d-flex align-items-start gap-3">
          <i
            :class="hasEnoughBalance ? 'bi bi-wallet2' : 'bi bi-exclamation-triangle-fill'"
            aria-hidden="true"
          />
          <div>
            <strong class="d-block mb-1">
              {{ hasEnoughBalance ? 'Saldo cabang aman untuk diproses' : 'Saldo cabang perlu disesuaikan' }}
            </strong>
            <span>{{ balanceMessage }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PawnContractConfirmationSectionModel } from '@feature/pawn_contract/presentation/models/pawn_contract_confirmation.model';

interface PawnContractFormSubmitConfirmationProps {
  sections: PawnContractConfirmationSectionModel[];
  statusLabel: string;
  balanceMessage: string;
  hasEnoughBalance: boolean;
}

const props = defineProps<PawnContractFormSubmitConfirmationProps>();
const sections: ReadonlyArray<PawnContractConfirmationSectionModel> = props.sections;
const statusLabel: string = props.statusLabel;
const balanceMessage: string = props.balanceMessage;
const hasEnoughBalance: boolean = props.hasEnoughBalance;
</script>
